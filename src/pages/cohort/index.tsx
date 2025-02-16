import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

// material-ui

// project import
import { Button, Stack } from '@mui/material';

import { MainCard } from '@digitalaidseattle/mui';
import { cohortService } from '../../api/ceCohortService';
import { PlanCard } from '../../components/PlanCard';
import { TextEdit } from '../../components/TextEdit';
import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { Cohort, Plan } from '../../api/types';
import { planService } from '../../api/cePlanService';

const CohortPage: React.FC = () => {
    const { id: cohortId } = useParams<string>();
    const { refresh, setRefresh } = useContext(RefreshContext);

    const notifications = useNotifications();

    const [cohort, setCohort] = useState<Cohort | null>();
    const [plans, setPlans] = useState<Plan[]>([]);

    useEffect(() => {
        if (cohortId) {
            cohortService.getById(cohortId)
                .then(cohort => setCohort(cohort))
        }
    }, [refresh, cohortId]);

    useEffect(() => {
        if (cohort) {
            planService.findByCohortId(cohort.id)
                .then(plans => setPlans(plans))
        }
    }, [cohort]);

    function handleNameChange(newText: string) {
        if (cohort) {
            cohortService
                .update(cohort.id.toString(), { name: newText }) // FIXME change ID to UUID
                .then(updated => {
                    setCohort(updated);
                    notifications.success(`Cohort ${updated.name} updated.`);
                    setRefresh(refresh + 1);
                });
        }
    }

    function handleNewPlan() {
        if (cohort) {
            planService.create(cohort)
                .then(plan => {
                    notifications.success(`Plan ${plan.name} created.`);
                })
        }
    }

    return (cohort &&
        <Stack gap={1}>
            <MainCard>
                <TextEdit label={'Name'} value={cohort.name} onChange={(val) => handleNameChange(val)} />
                <Button sx={{ marginTop: 1 }} variant="contained" onClick={handleNewPlan}>New Plan</Button>
            </MainCard>
            {/* Consider an alternate :  switch between selected plan and all plans */}
            <MainCard title="Plans">
                <Stack direction={'row'} gap={2}>
                    {plans.map(plan =>
                        <PlanCard plan={plan} />
                    )}
                </Stack>
            </MainCard>

        </Stack>
    )
};

export default CohortPage;
