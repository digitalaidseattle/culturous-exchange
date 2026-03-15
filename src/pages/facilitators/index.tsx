/**
 *  facilitators/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useState } from 'react';
// material-ui
import { Button, Stack } from '@mui/material';

// project import

import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { FacilitatorUploader } from '../../services/facilitator/FacilitatorUploader';
import { Facilitator, FailedProfile } from '../../api/types';
import FailedUploadModal from '../../components/FailedUploadModal';
import FileUploader from '../../components/FileUploader';
import ProfilesPage from '../../components/ProfilesPage';
import { TimeToggle } from '../../components/TimeToggle';
import { UI_STRINGS } from '../../constants';
import DetailsTable from './DetailsTable';
import FacilitatorModal from './FacilitatorModal';
import { CEFacilitatorService } from '../../services/facilitator/CEFacilitatorService';

const ToolsSection = () => {
    const facilitatorService = CEFacilitatorService.getInstance();
    const uploadService = FacilitatorUploader.getInstance();

    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [failedProfiles, setFailedProfiles] = useState<FailedProfile[]>([]);

    const [facilitator, setFacilitator] = useState<Facilitator>(facilitatorService.empty());
    const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);
    const [isAddFacilitatorModalOpen, setIsAddFacilitatorModalOpen] = useState<boolean>(false)

    async function handleUpload(files: File[]): Promise<void> {
        Promise
            .all(files.map(file => uploadService.insert_from_excel(file)))
            .then(resps => {
                let allFailed: FailedProfile[] = [];
                resps.forEach(resp => {
                    allFailed = allFailed.concat(resp.failedProfiles);
                })
                const allSuccess = resps.map(resp => resp.successCount)
                    .reduce((p, v) => p + v, 0);

                displayResults({
                    failedProfiles: allFailed,
                    successCount: allSuccess,
                    failedCount: allFailed.length,
                    attemptedCount: allFailed.length + allSuccess
                });
            })
            .catch((err) => {
                console.error('Unexpected Error: ', err)
                displayResults({
                    failedProfiles: [],
                    successCount: 0,
                    failedCount: files.length,
                    attemptedCount: files.length
                })
            })
            .finally(() => {
                setRefresh(refresh + 1);
            });
    }

    function displayResults(resp: { failedProfiles: FailedProfile[], failedCount: number, attemptedCount: number, successCount: number }) {
        setShowDropzone(false);
        if (resp.failedCount === resp.attemptedCount) {
            notifications.error(`Error uploading spreadsheet. Failed to add ${resp.successCount} of ${resp.attemptedCount}`)
            setFailedProfiles(resp.failedProfiles)
            setIsFailedModalOpen(true);
        } else if (resp.failedCount > 0) {
            setFailedProfiles(resp.failedProfiles)
            setIsFailedModalOpen(true);
            notifications.warn(
                `${resp.attemptedCount} Attempted, ${resp.successCount} added, ${resp.failedCount} failed.`
            );
        } else {
            notifications.success(`${resp.attemptedCount} Attempted, ${resp.successCount} successfully added`)
        }
    }

    const handleCloseAddFacilitatorModal = () => {
        setIsAddFacilitatorModalOpen(false)
    }

    const handleAddFacilitator = async (updated: Facilitator) => {
        return facilitatorService.save(updated)
            .then(added => notifications.success(`Success. Added facilitator: ${added.name}`))
            .catch(error => notifications.error(`Error. Could not add facilitator: ${error.message}`))
            .finally(() => {
                handleCloseAddFacilitatorModal();
                setRefresh(refresh + 1)
            })
    }

    return (
        <Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={2} m={2} direction={'row'}>
                    <Button
                        title={UI_STRINGS.UPLOAD}
                        variant="contained"
                        color="primary"
                        onClick={() => setShowDropzone(!showDropzone)}>
                        {UI_STRINGS.UPLOAD}
                    </Button>
                    <Button
                        title={UI_STRINGS.ADD_FACILITATOR}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setFacilitator(facilitatorService.empty())
                            setIsAddFacilitatorModalOpen(true)
                        }}>
                        {UI_STRINGS.ADD_FACILITATOR}
                    </Button>
                </Stack>
                <TimeToggle />
            </Stack>
            {showDropzone &&
                <FileUploader onChange={handleUpload} />
            }
            <FailedUploadModal
                isModalOpen={isFailedModalOpen}
                onClose={() => setIsFailedModalOpen(false)}
                failedProfiles={failedProfiles}
            />
            <FacilitatorModal
                mode={'add'}
                facilitator={facilitator}
                open={isAddFacilitatorModalOpen}
                onClose={() => handleCloseAddFacilitatorModal()}
                onChange={handleAddFacilitator} />
        </Stack>
    )
}

const FacilitatorsPage: React.FC = () => {
    return (
        <ProfilesPage
            title={UI_STRINGS.FACILITATORS_PAGE_TITLE}
            tools={<ToolsSection />}
            table={<DetailsTable />}
        />
    )
};

export default FacilitatorsPage;
