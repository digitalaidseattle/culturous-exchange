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
    const plans = [...(cohort.plans ?? [])].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <Stack gap={2}>
            {plans.length === 0 &&
                <Typography color="text.secondary">{UI_STRINGS.NO_PLANS_YET}</Typography>
            }
            {plans.map(plan => <PlanCard key={plan.id} planId={plan.id!} />)}
        </Stack>
    );
}
