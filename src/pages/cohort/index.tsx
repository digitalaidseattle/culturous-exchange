import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

// material-ui

// project import
import { Button, Stack } from '@mui/material';

import { MainCard } from '@digitalaidseattle/mui';
import { cohortService } from '../../api/ceCohortService';
import { PlanCard } from '../../components/PlanCard';
import { TextEdit } from '../../components/TextEdit';
import { useNotifications } from '@digitalaidseattle/core';
import { Cohort } from '../../api/types';

const CohortPage: React.FC = () => {
    const { id: cohortId } = useParams<string>();
    const notifications = useNotifications();

    const [cohort, setCohort] = useState<Cohort | null>();

    useEffect(() => {
        if (cohortId) {
            cohortService.getById(cohortId)
                .then(cohort => setCohort(cohort))
        }
    }, [cohortId]);

    function handleNameChange(newText: string) {
        if (cohort && cohort.id) {
            cohortService
                .update(cohort.id.toString(), { name: newText }) // FIXME change ID to UUID
                .then(updated => {
                    setCohort(updated);
                    notifications.success(`Cohort ${updated.name} updated.`)
                });
        }
    }

    return (cohort &&
        <Stack gap={1}>
            <MainCard>
                <TextEdit label={'Name'} value={cohort.name} onChange={(val) => handleNameChange(val)} />
                <Button sx={{ marginTop: 1 }} variant="contained" onClick={() => alert('A plan would be added.')}>New Plan</Button>
            </MainCard>
            {/* Consider an alternate :  switch between selected plan and all plans */}
            <Stack direction={'row'} gap={2}>
                {cohort.plans.map(plan =>
                    <PlanCard plan={plan} />
                )}
            </Stack>
        </Stack>
    )
};

export default CohortPage;
