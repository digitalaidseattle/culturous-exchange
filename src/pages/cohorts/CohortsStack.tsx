/**
 * CohortsStack.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { RefreshContext } from '@digitalaidseattle/core';
import { Stack } from '@mui/material';
import { useContext, useEffect, useState } from "react";
import { CECohortDao } from "../../api/ceCohortDao";
import { Cohort } from '../../api/types';
import { CohortCard } from './CohortCard';

export const CohortsStack = () => {
    const cohortDao = CECohortDao.getInstance();

    const { refresh } = useContext(RefreshContext);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);

    useEffect(() => {
        cohortDao
            .getAll()
            .then(cohorts => setCohorts(cohorts));
    }, [refresh]);

    return (cohorts.length > 0 &&
        <Stack gap={1}>
            {/* Consider an alternate :  switch between selected plan and all plans */}
            {cohorts.map(cohort =>
                <CohortCard key={cohort.id} cohort={cohort} />
            )}
        </Stack>
    );
}