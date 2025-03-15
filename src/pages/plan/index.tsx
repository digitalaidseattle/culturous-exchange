import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

// material-ui

// project import
import { Stack } from '@mui/material';

import { planService } from '../../api/cePlanService';
import { PlanDetails } from '../../components/PlanDetails';
import { Plan } from '../../api/types';

interface PlanContextType {
    plan: Plan,
    setPlan: (plan: Plan) => void
}


export const PlanContext = createContext<PlanContextType>({
    plan: {} as Plan,
    setPlan: () => { }
});

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
        <PlanContext.Provider value={{ plan, setPlan }}>
            <Stack gap={1}>
                <PlanDetails />
            </Stack>
        </PlanContext.Provider>
    )
};

export default PlanPage;
