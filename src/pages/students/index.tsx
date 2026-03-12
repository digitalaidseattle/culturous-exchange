/**
 *  students/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useState } from 'react';
// material-ui
import { Button, Stack } from '@mui/material';

// project import

import { RefreshContext, useNotifications } from '@digitalaidseattle/core';

import { CEStudentService } from '../../api/ceStudentService';
import { CETimeWindowService } from '../../api/ceTimeWindowService';
import { ProfileUploader } from '../../api/ProfileUploader';
import { FailedProfile, Student } from '../../api/types';
import { StudentValidationService } from '../../api/ValidationService';
import FailedUploadModal from '../../components/FailedUploadModal';
import FileUploader from '../../components/FileUploader';
import ProfilesPage from '../../components/ProfilesPage';
import { TimeToggle } from '../../components/TimeToggle';
import { UI_STRINGS } from '../../constants';
import StudentModal from './StudentModal';
import StudentsDetailsTable from './StudentsDetailsTable';

const ToolsSection = () => {
    const studentService = CEStudentService.getInstance();
    const uploadService = new ProfileUploader(
        StudentValidationService.getInstance()
    );

    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [failedProfiles, setFailedProfiles] = useState<FailedProfile[]>([]);
    const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false)
    const [student, setStudent] = useState<Student>(studentService.empty());

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

                displayUploadResults({
                    failedProfiles: allFailed,
                    successCount: allSuccess,
                    failedCount: allFailed.length,
                    attemptedCount: allFailed.length + allSuccess
                });
            })
            .catch((err) => {
                console.error('Unexpected Error: ', err)
                displayUploadResults({
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

    function displayUploadResults(resp: { failedProfiles: FailedProfile[], failedCount: number, attemptedCount: number, successCount: number }) {
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

    const handleCloseAddStudentModal = () => {
        setIsAddStudentModalOpen(false)
    }

    const handleAddStudent = async (updated: Student) => {
        const timeWindowService = CETimeWindowService.getInstance();
        const studentService = CEStudentService.getInstance();

        return timeWindowService
            .getTimeZone(updated.city!, updated.country)
            .then(resp => {
                updated.time_zone = resp.timezone
                updated.tz_offset = resp.offset
                timeWindowService.adjustTimeWindows(updated);
                studentService
                    .save(updated)
                    .then(saved => {
                        notifications.success(`Success. Added student: ${saved.name}`);
                    })
            })
            .finally(() => {
                handleCloseAddStudentModal();
                setRefresh(refresh + 1)
            })
    }

    return (
        <Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={2} m={2} direction={'row'}>
                    <Button
                        title={UI_STRINGS.UPLOAD_STUDENT}
                        variant="contained"
                        color="primary"
                        onClick={() => setShowDropzone(!showDropzone)}>
                        {UI_STRINGS.UPLOAD}
                    </Button>
                    <Button
                        title={UI_STRINGS.ADD_STUDENT}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setStudent(studentService.empty());
                            setIsAddStudentModalOpen(true);
                        }}
                    >
                        {UI_STRINGS.ADD_STUDENT}
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
            <StudentModal
                mode={'add'}
                student={student}
                open={isAddStudentModalOpen}
                onClose={() => handleCloseAddStudentModal()}
                onChange={handleAddStudent} />
        </Stack>
    )
}
const StudentsPage: React.FC = () => {
    return (
        <ProfilesPage
            title={UI_STRINGS.STUDENTS_PAGE_TITLE}
            tools={<ToolsSection />}
            table={<StudentsDetailsTable />}
        />
    )
};

export default StudentsPage;
