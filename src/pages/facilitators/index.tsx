/**
 *  students/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useState } from 'react';
// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';

import { createContext } from 'react';
import { Facilitator } from '../../api/types';
import { ShowLocalTimeContext } from '../../components/ShowLocalTimeContext';
import { TimeWindowSelectionContext } from '../../components/TimeWindowSelectionContext';
import FacilitatorsDetailsTable from './FacilitatorsDetailsTable';

interface FacilitatorContextType {
    facilitator: Facilitator,
    setFacilitator: React.Dispatch<React.SetStateAction<Facilitator>>
}

export const FacilitatorContext = createContext<FacilitatorContextType>({
    facilitator: {} as Facilitator,
    setFacilitator: () => { }
})


const FacilitatorsPage: React.FC = () => {
    const [facilitator, setFacilitator] = useState<Facilitator>({} as Facilitator);
    const [selection, setSelection] = useState<string[]>([]);
    const [showLocalTime, setShowLocalTime] = useState<boolean>(false);

    return (
        <FacilitatorContext.Provider value={{ facilitator, setFacilitator }}>
            <TimeWindowSelectionContext.Provider value={{ selection, setSelection }}>
                <ShowLocalTimeContext.Provider value={{ showLocalTime, setShowLocalTime }}>
                    <MainCard title="Facilitators Page">
                        <FacilitatorsDetailsTable />
                    </MainCard>
                </ShowLocalTimeContext.Provider>
            </TimeWindowSelectionContext.Provider>
        </FacilitatorContext.Provider>
    )
};

export default FacilitatorsPage;
