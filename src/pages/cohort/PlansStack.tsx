/**
 * SetupPanel.tsx
 * 
 * Example of integrating tickets with data-grid
 */
import { useContext } from 'react';

// material-ui
import {
    Stack
} from '@mui/material';

// third-party

// project import
import { CohortContext } from '.';
import { PlanCard } from '../../components/PlanCard';

export const PlansStack: React.FC = () => {

    const { cohort } = useContext(CohortContext);

    return (
        <Stack direction={'row'} gap={2} >
            {
                cohort.plans.map(plan =>
                    <PlanCard key={plan.id} plan={plan} />
                )
            }
        </Stack>
    );
}
