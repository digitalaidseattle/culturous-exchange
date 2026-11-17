/**
 * home/index.tsx
 *
 *  The home page highlights the current (most recent) cohort and lists
 *  the others below it. New cohorts are made in the Create Cohort window, opened from the
 *  button beside "All Other Cohorts" or from the floating action button (HomeActions),
 *  which also imports student lists.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

// material-ui
import { PlusOutlined } from '@ant-design/icons';
import { Button, Stack, Typography } from '@mui/material';

// project import
import { RefreshContext } from '@digitalaidseattle/core';
import { CECohortDao } from '../../api/ceCohortDao';
import { Cohort } from '../../api/types';
import { UI_STRINGS } from '../../constants';
import { CreateCohortDialog } from '../../components/CreateCohortDialog';
import { CohortCard } from './CohortCard';
import { GetStartedCard } from './GetStartedCard';
import { HomeActions } from './HomeActions';
import { WelcomeBanner } from './WelcomeBanner';

const createdTime = (cohort: Cohort): number =>
    cohort.created_at ? new Date(cohort.created_at).getTime() : 0;

const HomePage: React.FC = () => {

    const { refresh, setRefresh } = useContext(RefreshContext);
    const [createOpen, setCreateOpen] = useState<boolean>(false);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);

    // newest first, so the first cohort is the current one
    useEffect(() => {
        CECohortDao.getInstance()
            .getAll()
            .then(all => setCohorts([...all].sort((a, b) => createdTime(b) - createdTime(a))));
    }, [refresh]);

    const current = cohorts[0];
    // the current cohort has its own section above, so it is not listed again
    const others = cohorts.slice(1);

    return (
        <Stack gap={4} sx={{ paddingBottom: 12 }}>
            <WelcomeBanner />
            <GetStartedCard />
            {current &&
                <Stack gap={2}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 400 }}>
                        {UI_STRINGS.CURRENT_COHORT}
                    </Typography>
                    <CohortCard cohort={current} isCurrent />
                </Stack>
            }
            <Stack gap={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 400 }}>
                        {UI_STRINGS.ALL_COHORTS}
                    </Typography>
                    <Button variant="outlined" sx={{ textTransform: 'none' }} startIcon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                        {UI_STRINGS.NEW_COHORT}
                    </Button>
                </Stack>
                {others.length === 0 && <Typography color="text.secondary">{UI_STRINGS.NO_OTHER_COHORTS}</Typography>}
                {others.map(cohort => <CohortCard key={cohort.id} cohort={cohort} />)}
            </Stack>
            <HomeActions onNewCohort={() => setCreateOpen(true)} />
            <CreateCohortDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCohortCreated={() => setRefresh(refresh + 1)} />
        </Stack>
    );
};

export default HomePage;
