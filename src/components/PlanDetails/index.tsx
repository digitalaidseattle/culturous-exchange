/**
 *  PlanDetails/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useNotifications } from '@digitalaidseattle/core';
import { MainCard } from '@digitalaidseattle/mui';
import { Box, Button, Stack, Step, StepLabel, Stepper } from '@mui/material';
import { createContext, useContext, useState } from "react";
import { planService } from '../../api/cePlanService';
import { PlanContext } from '../../pages/plan';
import { GroupBoard } from "./GroupBoard";
import { GroupSize } from './GroupSize';
import { SetupStudents } from './SetupStudents';
import { TextEdit } from '../TextEdit';

// NEW : Add StepperContext to memorize GroupSize

interface StepperContextType {
  groupSize: number;
  setGroupSize: (size: number) => void;
}

export const StepperContext = createContext<StepperContextType>({
  groupSize: 5,
  setGroupSize: () => { }
});


const SteppedDetails: React.FC = () => {
  const [groupSize, setGroupSize] = useState<number>(5);
  const steps = ['Setup Students', 'Group Size', 'Review'];
  const [activeStep, setActiveStep] = useState(0);

  function handleBack() {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function handleNext() {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  return (
    <StepperContext.Provider value={{ groupSize, setGroupSize }}>
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
          {activeStep === 1 && <GroupSize />}
          {activeStep === 2 && <GroupBoard />}
        </>
      </Box>
    </StepperContext.Provider>
  );
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
        <SteppedDetails />
      </Stack>
    </MainCard>
  );
}
