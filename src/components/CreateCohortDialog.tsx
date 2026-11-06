/**
 *  CreateCohortDialog.tsx
 *
 *  The "Create Cohort" window, a two step wizard opened by New Cohort on the home page.
 *
 *  The first step asks for the cohort's name and the students' spreadsheet. Next adds the
 *  spreadsheet's students to the student list, creates the cohort with them, and slides to
 *  the second step: the Create New Plan panel (see NewPlanPanel), for the new cohort. Create
 *  plan makes the plan and opens it. Cancel on the second step closes the window and leaves
 *  the cohort as it is, with no plan yet.
 *
 *  Without a spreadsheet the cohort starts with the students who are not in a cohort yet,
 *  as New Cohort always did.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNotifications } from "@digitalaidseattle/core";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useState } from "react";
import { CECohortDao } from "../api/ceCohortDao";
import { Cohort, FailedProfile } from "../api/types";
import { UI_STRINGS } from "../constants";
import { createCohort } from "../services/cohort/createCohort";
import { uploadStudents } from "../services/student/uploadStudents";
import FailedUploadModal from "./FailedUploadModal";
import { NewPlanPanel } from "./NewPlanPanel";
import { StudentFileDropzone } from "./StudentFileDropzone";

const NAME_STEP = 0;
const PLAN_STEP = 1;

/** Each step is as tall as its contents, up to the height of the window. */
const stepSx = {
    gridArea: '1 / 1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    maxHeight: 'calc(100dvh - 64px)'
} as const;

export const CreateCohortDialog = (props: {
    open: boolean,
    onClose: () => void,
    /** called once the cohort exists, so the list of cohorts can show it */
    onCohortCreated?: () => void
}) => {
    const { open, onClose, onCohortCreated } = props;
    const notifications = useNotifications();

    const [step, setStep] = useState<number>(NAME_STEP);
    const [name, setName] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [creating, setCreating] = useState<boolean>(false);
    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [planBusy, setPlanBusy] = useState<boolean>(false);
    const [failedProfiles, setFailedProfiles] = useState<FailedProfile[]>([]);
    const [failedOpen, setFailedOpen] = useState<boolean>(false);
    const busy = creating || planBusy;

    const trimmedName = name.trim();
    const canContinue = trimmedName.length > 0 && !busy;

    const handleNext = async () => {
        if (!canContinue) {
            return;
        }
        setCreating(true);
        try {
            let students;
            if (file) {
                const upload = await uploadStudents([file]);
                if (upload.failedProfiles.length > 0) {
                    setFailedProfiles(upload.failedProfiles);
                    setFailedOpen(true);
                }
                if (upload.students.length === 0) {
                    // nothing to put in a cohort: stay here, so another file can be chosen
                    notifications.error(`No students could be added from ${file.name}.`);
                    return;
                }
                if (upload.failedProfiles.length > 0) {
                    notifications.warn(`${upload.students.length + upload.failedProfiles.length} attempted, ${upload.students.length} added, ${upload.failedProfiles.length} failed.`);
                }
                students = upload.students;
            }
            const created = await createCohort({ name: trimmedName, students });
            // reload it, so the plan step has the students and their times
            const loaded = await CECohortDao.getInstance().getById(created.id!);
            setCohort(loaded ?? created);
            notifications.success(`Cohort ${created.name} created.`);
            onCohortCreated?.();
            setStep(PLAN_STEP);
        } catch (error) {
            console.error('Could not create cohort.', error);
            notifications.error(`${UI_STRINGS.UNABLE_TO_CREATE_COHORT}. ${error instanceof Error ? error.message : error}`);
        } finally {
            setCreating(false);
        }
    };

    const reset = () => {
        setStep(NAME_STEP);
        setName('');
        setFile(null);
        setCohort(null);
        setPlanBusy(false);
    };

    return (
        <>
            <Dialog
                open={open}
                // do not close the window while something is being made
                onClose={busy ? undefined : onClose}
                fullWidth
                maxWidth="md"
                slotProps={{ transition: { onExited: reset } }}>
                <Box sx={{ display: 'grid', overflow: 'hidden', minHeight: 0 }}>
                    <Slide in={step === NAME_STEP} direction="right" appear={false} unmountOnExit>
                        <Box sx={stepSx}>
                            <DialogTitle>{UI_STRINGS.CREATE_COHORT}</DialogTitle>
                            <DialogContent>
                                <Stack gap={3} sx={{ paddingTop: 1 }}>
                                    <TextField
                                        autoFocus
                                        label={UI_STRINGS.COHORT_NAME_LABEL}
                                        value={name}
                                        disabled={busy}
                                        onChange={(event) => setName(event.target.value)}
                                        onKeyDown={(event) => { if (event.key === 'Enter') handleNext(); }} />
                                    <Stack gap={0.75}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{UI_STRINGS.STUDENTS_FILE_LABEL}</Typography>
                                        <StudentFileDropzone
                                            label={UI_STRINGS.STUDENTS_FILE_LABEL}
                                            file={file}
                                            onChange={setFile}
                                            disabled={busy} />
                                        <Typography variant="caption" color="text.secondary">{UI_STRINGS.STUDENT_FILE_HELP}</Typography>
                                    </Stack>
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ padding: '8px 24px 16px' }}>
                                <Button onClick={onClose} disabled={busy}>{UI_STRINGS.CANCEL}</Button>
                                <Button
                                    variant="contained"
                                    disabled={!canContinue}
                                    startIcon={creating ? <CircularProgress size={16} color="inherit" /> : undefined}
                                    endIcon={creating ? undefined : <ArrowRightOutlined />}
                                    onClick={handleNext}>
                                    {creating ? UI_STRINGS.CREATING_COHORT : UI_STRINGS.NEXT}
                                </Button>
                            </DialogActions>
                        </Box>
                    </Slide>
                    <Slide in={step === PLAN_STEP} direction="left" mountOnEnter unmountOnExit>
                        <Box sx={stepSx}>
                            {cohort && <NewPlanPanel cohort={cohort} onClose={onClose} onBusyChange={setPlanBusy} />}
                        </Box>
                    </Slide>
                </Box>
            </Dialog>
            <FailedUploadModal
                isModalOpen={failedOpen}
                onClose={() => setFailedOpen(false)}
                failedProfiles={failedProfiles} />
        </>
    );
};
