/**
 *  HomeActions.tsx
 *
 *  Floating action button for the home page. Opens a speed dial with
 *  "New Cohort" and "Import Student List".
 *
 *  Importing adds the spreadsheet's students to the global student list,
 *  exactly like Upload on the Students page. Students are not enrolled in
 *  any cohort by the import.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { FolderAddOutlined, UploadOutlined } from "@ant-design/icons";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import { FailedProfile } from "../../api/types";
import FailedUploadModal from "../../components/FailedUploadModal";
import { UI_STRINGS } from "../../constants";
import { StudentUploader } from "../../services/student/StudentUploader";

interface UploadResults {
    failedProfiles: FailedProfile[];
    failedCount: number;
    attemptedCount: number;
    successCount: number;
}

export const HomeActions = (props: { onNewCohort: () => void }) => {
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);

    const fileInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [failedProfiles, setFailedProfiles] = useState<FailedProfile[]>([]);
    const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);

    function displayUploadResults(resp: UploadResults) {
        if (resp.failedCount === resp.attemptedCount) {
            notifications.error(`Error uploading spreadsheet. Failed to add ${resp.successCount} of ${resp.attemptedCount}`);
            setFailedProfiles(resp.failedProfiles);
            setIsFailedModalOpen(true);
        } else if (resp.failedCount > 0) {
            setFailedProfiles(resp.failedProfiles);
            setIsFailedModalOpen(true);
            notifications.warn(`${resp.attemptedCount} Attempted, ${resp.successCount} added, ${resp.failedCount} failed.`);
        } else {
            notifications.success(`${resp.attemptedCount} Attempted, ${resp.successCount} successfully added`);
        }
    }

    async function handleFiles(files: File[]): Promise<void> {
        const uploader = StudentUploader.getInstance();
        try {
            const resps = await Promise.all(files.map(file => uploader.insert_from_excel(file)));
            const failed = resps.flatMap(resp => resp.failedProfiles);
            const successCount = resps.reduce((total, resp) => total + resp.successProfiles.length, 0);
            displayUploadResults({
                failedProfiles: failed,
                successCount: successCount,
                failedCount: failed.length,
                attemptedCount: failed.length + successCount
            });
        } catch (err) {
            console.error('Unexpected Error: ', err);
            displayUploadResults({
                failedProfiles: [],
                successCount: 0,
                failedCount: files.length,
                attemptedCount: files.length
            });
        } finally {
            setRefresh(refresh + 1);
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';  // allow choosing the same file again
        if (files.length > 0) {
            handleFiles(files);
        }
    };

    const actions = [
        {
            name: UI_STRINGS.NEW_COHORT,
            icon: <FolderAddOutlined />,
            onClick: () => props.onNewCohort()
        },
        {
            name: UI_STRINGS.IMPORT_STUDENT_LIST,
            icon: <UploadOutlined />,
            onClick: () => fileInput.current?.click()
        }
    ];

    return (
        <>
            <input
                ref={fileInput}
                type="file"
                hidden
                multiple
                accept=".xlsx,.xls"
                onChange={handleFileChange} />
            <SpeedDial
                ariaLabel={UI_STRINGS.COHORT_ACTIONS}
                sx={{ position: 'fixed', bottom: 24, right: 24 }}
                icon={<SpeedDialIcon />}
                open={open}
                // open and close on click only, so hovering first and then clicking does not close it again
                onOpen={(_event, reason) => { if (reason === 'toggle') setOpen(true); }}
                onClose={(_event, reason) => { if (reason !== 'mouseLeave') setOpen(false); }}>
                {actions.map(action =>
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        sx={{ '& .MuiSpeedDialAction-staticTooltipLabel': { whiteSpace: 'nowrap' } }}
                        onClick={() => {
                            setOpen(false);
                            action.onClick();
                        }} />
                )}
            </SpeedDial>
            <FailedUploadModal
                isModalOpen={isFailedModalOpen}
                onClose={() => setIsFailedModalOpen(false)}
                failedProfiles={failedProfiles} />
        </>
    );
};
