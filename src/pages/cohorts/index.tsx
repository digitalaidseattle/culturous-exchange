
// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';
// project import
import { Button, Stack } from '@mui/material';

import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { useContext } from 'react';
import { cohortService } from '../../api/ceCohortService';
import { CohortsStack } from './CohortsStack';

// ================================|| 404 ||================================ //



const CohortsPage: React.FC = () => {
    const { refresh, setRefresh } = useContext(RefreshContext);

    const notifications = useNotifications();

    const newCohort = async () => {
        const cohort = await cohortService.create();
        if (cohort) {
            notifications.success(`Chort ${cohort.name} created.`);
            setRefresh(refresh + 1);
        } else {
            notifications.error('Unable to create new cohort');
        }
    }

    return (
        <Stack gap={1}>
            <MainCard title="Cohorts">
                <Stack margin="1" gap="1" direction="row" spacing={'1rem'}>
                    <Button
                        title='Action'
                        variant="contained"
                        color="primary"
                        onClick={newCohort}>
                        {'New'}
                    </Button>
                </Stack>
            </MainCard>
            <CohortsStack />
        </Stack>
    );

};

export default CohortsPage;
