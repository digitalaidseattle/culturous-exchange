/**
 * home/GetStartedCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { blue, green } from '@mui/material/colors';

// project import
import { useNotifications } from '@digitalaidseattle/core';

import FileUploader from '../../components/FileUploader';
import { UI_STRINGS } from '../../constants';
import { CECohortService } from '../../services/cohort/ceCohortService';
import { createCohort } from '../../services/cohort/createCohort';
import { StudentUploader } from '../../services/student/StudentUploader';

export const GetStartedCard: React.FC = () => {

    const theme = useTheme();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const uploadService = StudentUploader.getInstance();
    const cohortService = CECohortService.getInstance();

    const [activeStep, setActiveStep] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<Record<string, string[]>>({});
    const [generating, setGenerating] = useState<boolean>(false);
    const [nameError, setNameError] = useState<string>('');
    const [validating, setValidating] = useState<boolean>(false);

    function handleNameChange(value: string) {
        setName(value);
        setNameError('');
    }

    async function validateName() {
        setValidating(true);
        try {
            if (await cohortService.nameExists(name)) {
                setNameError(UI_STRINGS.COHORT_NAME_EXISTS);
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            setNameError(UI_STRINGS.UNABLE_TO_VALIDATE_COHORT_NAME);
        } finally {
            setValidating(false);
        }
    }

    async function handleFiles(dropped: File[]): Promise<void> {
        const results = await Promise.all(dropped.map(file => uploadService.validate_excel(file)));
        setFileErrors(prev => {
            const updated = { ...prev };
            dropped.forEach((file, idx) => updated[file.name] = results[idx]);
            return updated;
        });
        // add to the current selection; a file with the same name replaces the earlier one
        setFiles(prev => [...prev.filter(p => !dropped.some(d => d.name === p.name)), ...dropped]);
    }

    function removeFile(file: File) {
        setFiles(prev => prev.filter(f => f !== file));
    }

    const hasInvalidFile = files.some(file => (fileErrors[file.name] ?? []).length > 0);

    async function generate() {
        setGenerating(true);
        try {
            const resps = await Promise.all(files.map(file => uploadService.insert_from_excel(file)));
            const failedCount = resps.reduce((p, resp) => p + resp.failedProfiles.length, 0);
            if (failedCount > 0) {
                notifications.error(`${UI_STRINGS.ERROR_ADDING_STUDENTS} (${failedCount})`);
            }
            const cohort = await createCohort(name.trim());
            try {
                const plan = await cohortService.createPlan(cohort);
                notifications.success(`Cohort ${cohort.name} and plan created.`);
                navigate(`/plan/${plan.id}`);
            } catch (err: any) {
                // the cohort exists at this point, so send the user to it
                console.error('Could not create plan.', err);
                notifications.error(`Cohort ${cohort.name} created, but could not create plan. ${err.message ?? ''}`);
                navigate(`/cohort/${cohort.id}`);
            }
        } catch (err) {
            console.error(err);
            notifications.error(UI_STRINGS.UNABLE_TO_CREATE_COHORT);
        } finally {
            setGenerating(false);
        }
    }

    const back = () => setActiveStep(activeStep - 1);
    const next = () => setActiveStep(activeStep + 1);

    return (
        <Card>
            <CardHeader
                sx={{
                    background: `linear-gradient(to right, ${green[200]}, ${blue[900]})`,
                    color: theme.palette.common.white
                }}
                title={UI_STRINGS.GET_STARTED}
                subheader={'Create a cohort and a plan'}
                />
            <CardContent>
                <Stepper activeStep={activeStep} orientation='vertical'>
                    <Step>
                        <StepLabel>{UI_STRINGS.STEP_COHORT_NAME}</StepLabel>
                        <StepContent>
                            <TextField
                                label={UI_STRINGS.COHORT_NAME}
                                value={name}
                                onChange={evt => handleNameChange(evt.target.value)}
                                error={nameError.length > 0}
                                helperText={nameError}
                                size='small'
                                fullWidth />
                            <Box mt={1}>
                                <Button variant='contained' disabled={name.trim().length === 0 || validating} onClick={validateName}>{UI_STRINGS.NEXT}</Button>
                            </Box>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>{UI_STRINGS.STEP_UPLOAD_STUDENTS}</StepLabel>
                        <StepContent>
                            <FileUploader onChange={handleFiles} />
                            {files.length > 0 &&
                                <Stack direction='row' flexWrap='wrap' gap={1} mt={1}>
                                    {files.map(file => {
                                        const errors = fileErrors[file.name] ?? [];
                                        return (
                                            <Tooltip key={file.name} title={errors.join(' ')}>
                                                <Chip
                                                    label={file.name}
                                                    size='small'
                                                    color={errors.length > 0 ? 'error' : 'default'}
                                                    onDelete={() => removeFile(file)} />
                                            </Tooltip>
                                        )
                                    })}
                                </Stack>
                            }
                            {hasInvalidFile &&
                                <Typography variant='body2' color='error' mt={1}>
                                    {UI_STRINGS.SPREADSHEET_INVALID_FILES}
                                </Typography>
                            }
                            <Stack direction='row' gap={1} mt={1}>
                                <Button onClick={back}>{UI_STRINGS.BACK}</Button>
                                <Button variant='contained' disabled={files.length === 0 || hasInvalidFile} onClick={next}>{UI_STRINGS.NEXT}</Button>
                            </Stack>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>{UI_STRINGS.STEP_GENERATE_COHORT}</StepLabel>
                        <StepContent>
                            <Stack direction='row' gap={1}>
                                <Button disabled={generating} onClick={back}>{UI_STRINGS.BACK}</Button>
                                <Button variant='contained' disabled={generating} onClick={generate}>{UI_STRINGS.GENERATE_COHORT}</Button>
                            </Stack>
                        </StepContent>
                    </Step>
                </Stepper>
            </CardContent>
        </Card>
    )
};
