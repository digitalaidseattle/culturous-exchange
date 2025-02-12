/**
 * CohortsStack.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { RefreshContext } from '@digitalaidseattle/core';
import { Stack } from '@mui/material';
import { useContext, useEffect, useState } from "react";
import { cohortService } from "../../api/ceCohortService";
import { CohortCard } from './CohortCard';
import { Cohort } from '../../api/types';
import { MainCard } from '@digitalaidseattle/mui';

export const CohortsStack = () => {
    const { refresh } = useContext(RefreshContext);

    const [cohorts, setCohorts] = useState<Cohort[]>([]);

    useEffect(() => {
        cohortService
            .getAll()
            .then(cc => setCohorts(cc));
    }, [refresh]);

    return (cohorts.length > 0 &&
        <MainCard>
            <Stack gap={1}>
                {/* Consider an alternate :  switch between selected plan and all plans */}
                <Stack direction={'row'} gap={2}>
                    {cohorts.map(cohort =>
                        <CohortCard cohort={cohort} />
                    )}
                </Stack>
            </Stack>
        </MainCard>
    );
}