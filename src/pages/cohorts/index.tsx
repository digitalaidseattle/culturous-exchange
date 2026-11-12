/**
 * cohorts/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

// material-ui

// project import
// project import
import { HomeOutlined } from '@ant-design/icons';
import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { Breadcrumbs, Button, Card, CardContent, CardHeader, IconButton, Link, Stack, Typography } from '@mui/material';
import { useContext } from 'react';
import { UI_STRINGS } from '../../constants';
import { createCohort } from '../../services/cohort/createCohort';
import { CohortsStack } from './CohortsStack';

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
                <IconButton LinkComponent={Link} href="/" size="medium" aria-label="home">
                    <HomeOutlined />
                </IconButton>
                <Typography color="text.primary">{UI_STRINGS.COHORTS}</Typography>
            </Breadcrumbs>
            <Card>
                <CardHeader
                    title={UI_STRINGS.COHORTS}
                    action={<Button
                        title='Action'
                        variant="contained"
                        color="primary"
                        onClick={newCohort}>
                        {UI_STRINGS.NEW}
                    </Button>}
                />
                <CardContent>
                    <CohortsStack />
                </CardContent>
            </Card>
        </Stack>
    );

};

export default CohortsPage;
