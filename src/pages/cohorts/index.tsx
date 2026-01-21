
// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';
// project import
import { Button, Stack } from '@mui/material';

import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { useContext } from 'react';
import { cohortService } from '../../api/ceCohortService';
import { UI_STRINGS } from '../../constants';
import { CohortsStack } from './CohortsStack';

// ================================|| 404 ||================================ //



const CohortsPage: React.FC = () => {
    const { refresh, setRefresh } = useContext(RefreshContext);

    const notifications = useNotifications();

    const newCohort = async () => {
        const cohort = await cohortService.create();
        if (cohort) {
            notifications.success(`Cohort ${cohort.name} created.`);
            setRefresh(refresh + 1);
        } else {
            notifications.error(UI_STRINGS.UNABLE_TO_CREATE_COHORT);
        }
    }

    return (
        <Stack gap={1}>
            <MainCard title={UI_STRINGS.COHORTS}>
                <Stack margin="1" gap="1" direction="row" spacing={'1rem'}>
                    <Button
                        title='Action'
                        variant="contained"
                        color="primary"
                        onClick={newCohort}>
                        {UI_STRINGS.NEW}
                    </Button>
                </Stack>
            </MainCard>
            <CohortsStack />
        </Stack>
    );

};

export default CohortsPage;
