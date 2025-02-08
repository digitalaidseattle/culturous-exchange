/**
 *  App.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MainCard } from '@digitalaidseattle/mui';
import { Box, Button, Stack, Step, StepLabel, Stepper } from '@mui/material';
import { useState } from "react";
import { PlanProps } from '../../utils/props';
import { TextEdit } from "../TextEdit";
import { GroupBoard } from "./GroupBoard";
import { GroupCount } from './GroupCount';
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

const SteppedDetails: React.FC<PlanProps> = ({ plan }) => {
    const steps = ['Setup Students', 'Set Group Number', 'Review'];

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
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button
                            disabled={activeStep >= steps.length - 1}
                            onClick={handleNext}>
                            Next
                        </Button>
                    </Box>
                    {activeStep === 0 && <SetupStudents plan={plan} />}
                    {activeStep === 1 && <GroupCount plan={plan} />}
                    {activeStep === 2 && <GroupBoard plan={plan} />}
                </>
            </Box>
        </>);
}


export const PlanDetails: React.FC<PlanProps> = ({ plan }) => {

    // TODO add breadcrumbs
    return (
        <MainCard sx={{ width: '100%' }}>
            <Stack spacing={{ xs: 1, sm: 4 }}>
                <Stack spacing={{ xs: 1, sm: 4 }} direction='row'>
                    <TextEdit label={'Name'} value={plan.name} onChange={(text: string) => alert(`TODO  save : ${text} name`)} />
                    <TextEdit label={'Notes'} value={plan.notes} onChange={(text: string) => alert(`TODO  note save : ${text}`)} />
                </Stack>

                {/* <TabbedDetails plan={plan} /> */}
                <SteppedDetails plan={plan} />
            </Stack>
        </MainCard>
    );
}
