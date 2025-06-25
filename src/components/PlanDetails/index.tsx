/**
 *  PlanDetails/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Box, Button, Step, StepLabel, Stepper } from '@mui/material';
import { useContext, useState } from "react";
import { PlanContext } from '../../pages/plan';
import { GroupBoard } from "./GroupBoard";
import { GroupSize } from './GroupSize';
import { SetupStudents } from './SetupStudents';

export const PlanDetails: React.FC = () => {
    const { plan } = useContext(PlanContext);
    const steps = ['Setup Students', 'Group Size', 'Review'];
    const [activeStep, setActiveStep] = useState(0);

    function handleBack() {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    function handleNext() {
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
                    {activeStep === 2 && <GroupBoard />}
                </>
            </Box>
        </>);
}
