/**
 * PlansStack.tsx
 *
 * The plans of the current cohort, one wide card per plan.
 */
import { useContext } from 'react';

// material-ui
import { Stack, Typography } from '@mui/material';

// project import
import { CohortContext } from '.';
import { PlanCard } from '../../components/PlanCard';
import { UI_STRINGS } from '../../constants';

export const PlansStack: React.FC = () => {

    const { cohort } = useContext(CohortContext);
    // the active plan is shown under the cohort summary, so it is left out of this list
    const plans = [...(cohort.plans ?? [])]
        .filter(plan => !plan.active)
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <Stack gap={2}>
            {(cohort.plans ?? []).length === 0 &&
                <Typography color="text.secondary">{UI_STRINGS.NO_PLANS_YET}</Typography>
            }
            {plans.map(plan => <PlanCard key={plan.id} planId={plan.id!} />)}
        </Stack>
    );
}
