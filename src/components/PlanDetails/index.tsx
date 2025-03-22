/**
 *  App.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useNotifications } from '@digitalaidseattle/core';
import { MainCard } from '@digitalaidseattle/mui';
import { Box, Button, Stack, Step, StepLabel, Stepper } from '@mui/material';
import { useContext, useState } from "react";
import { planService } from '../../api/cePlanService';
import { PlanContext } from '../../pages/plan';
import { TextEdit } from "../TextEdit";
import { GroupBoard } from "./GroupBoard";
import { GroupSize } from './GroupSize';
import { SetupStudents } from './SetupStudents';

// const TabbedDetails: React.FC<PlanProps> = ({ plan }) => {
//     const [value, setValue] = useState<number>(0);

//     const changeTab = (_event: React.SyntheticEvent, newValue: number) => {
//         setValue(newValue);
//     };

//     return (
//         <>
//             <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                 <Tabs value={value} onChange={changeTab} aria-label="basic tabs example">
//                     <Tab label="Setup Students" />
//                     <Tab label="Number of groups" />
//                     <Tab label="Review" />
//                 </Tabs>
//             </Box>
//             <TabPanel value={value} index={0}>
//                 <SetupStudents plan={plan} />
//             </TabPanel>
//             <TabPanel value={value} index={1}>
//                 <GroupCount plan={plan} />
//             </TabPanel>
//             <TabPanel value={value} index={2}>
//                 <GroupBoard plan={plan} />
//             </TabPanel>
//         </>);
// }

const SteppedDetails: React.FC = () => {
    const {plan} = useContext(PlanContext);

    const steps = ['Setup Students', 'Group Size', 'Review'];

    const [activeStep, setActiveStep] = useState(0);

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label) => {
                        const stepProps: { completed?: boolean } = {};
                        const labelProps: {
                            optional?: React.ReactNode;
                        } = {};

                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Button
                            variant='outlined'
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button
                            variant='outlined'
                            disabled={activeStep >= steps.length - 1}
                            onClick={handleNext}>
                            Next
                        </Button>
                    </Box>
                    {activeStep === 0 && <SetupStudents />}
                    {activeStep === 1 && <GroupSize plan={plan} />}
                    {activeStep === 2 && <GroupBoard plan={plan} />}
                </>
            </Box>
        </>);
}

export const PlanDetails: React.FC = () => {
    const notification = useNotifications();
    const { plan, setPlan } = useContext(PlanContext);

    function handleNameUpdate(text: string) {
        planService.update(plan.id, { name: text })
            .then(updated => {
                notification.success('Plan updated.');
                setPlan(updated)
            })
    }

    function handleNoteUpdate(text: string) {
        planService.update(plan.id, { note: text })
            .then(updated => {
                notification.success('Plan updated.');
                setPlan(updated)
            })
    }

    // TODO add breadcrumbs
    return (
        <MainCard sx={{ width: '100%' }}>
            <Stack spacing={{ xs: 1, sm: 4 }}>
                <Stack spacing={{ xs: 1, sm: 4 }} direction='row'>
                    <TextEdit label={'Name'} value={plan.name} onChange={handleNameUpdate} />
                    <TextEdit label={'Notes'} value={plan.note} onChange={handleNoteUpdate} />
                </Stack>

                {/* <TabbedDetails plan={plan} /> */}
                <SteppedDetails />
            </Stack>
        </MainCard>
    );
}
