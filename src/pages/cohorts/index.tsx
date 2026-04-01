/**
 * cohorts/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';
// project import
import { Breadcrumbs, Link, Button, Stack, Typography, IconButton } from '@mui/material';
import { HomeOutlined } from '@ant-design/icons';
import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { useContext } from 'react';
import { UI_STRINGS } from '../../constants';
import { CohortsStack } from './CohortsStack';
import { createCohort } from '../../services/cohort/createCohort';

// ================================|| 404 ||================================ //

const CohortsPage: React.FC = () => {

    const { refresh, setRefresh } = useContext(RefreshContext);

    const notifications = useNotifications();

    const newCohort = async () => {
        const cohort = await createCohort();
        if (cohort) {
            notifications.success(`Cohort ${cohort.name} created.`);
            setRefresh(refresh + 1);
        } else {
            notifications.error(UI_STRINGS.UNABLE_TO_CREATE_COHORT);
        }
    }

    return (
        <Stack gap={1}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link href="/"><IconButton size="medium"><HomeOutlined /></IconButton></Link>
                <Typography color="text.primary">{UI_STRINGS.COHORTS}</Typography>
            </Breadcrumbs>
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
