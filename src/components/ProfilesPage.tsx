/**
 *  ProfilePage.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { ReactNode, useState } from 'react';
import { createContext } from 'react';

import { MainCard } from '@digitalaidseattle/mui';

import { UI_STRINGS } from '../constants';
import { ShowLocalTimeContext } from './ShowLocalTimeContext';
import { TimeWindowSelectionContext } from './TimeWindowSelectionContext';
import { CEProfile } from '../api/types';

interface ProfileContextType {
    profile: CEProfile,
    setProfile: React.Dispatch<React.SetStateAction<CEProfile>>
}

export const ProfileContext = createContext<ProfileContextType>({
    profile: {} as CEProfile,
    setProfile: () => { }
})

interface Props {
    tools: ReactNode,
    table: ReactNode,
}
const ProfilesPage: React.FC<Props> = ({ tools, table }) => {
    const [profile, setProfile] = useState<CEProfile>({} as CEProfile);
    const [selection, setSelection] = useState<string[]>([]);
    const [showLocalTime, setShowLocalTime] = useState<boolean>(false);

    return (
        <ProfileContext.Provider value={{ profile, setProfile }}>
            <TimeWindowSelectionContext.Provider value={{ selection, setSelection }}>
                <ShowLocalTimeContext.Provider value={{ showLocalTime, setShowLocalTime }}>
                    <MainCard title={UI_STRINGS.STUDENTS_PAGE_TITLE}>
                        {tools}
                        {table}
                    </MainCard>
                </ShowLocalTimeContext.Provider>
            </TimeWindowSelectionContext.Provider>
        </ProfileContext.Provider>
    )
};

export default ProfilesPage;
