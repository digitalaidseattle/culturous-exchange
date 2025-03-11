import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

// material-ui

// project import
import { Stack } from '@mui/material';

import { planService } from '../../api/cePlanService';
import { PlanDetails } from '../../components/PlanDetails';
import { Plan } from '../../api/types';

const PlanPage: React.FC = () => {
    const { id: planId } = useParams<string>();
    const [plan, setPlan] = useState<Plan>();

    useEffect(() => {
        if (planId) {
            planService.getById(planId)
                .then(p => setPlan(p!))
        }
    }, [planId]);
    
    return (plan &&
        <Stack gap={1}>
            <PlanDetails plan={plan} />
        </Stack>
    )
};

export default PlanPage;
