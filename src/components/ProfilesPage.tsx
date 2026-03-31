/**
 *  ProfilePage.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { createContext, ReactNode, useState } from 'react';

import { MainCard } from '@digitalaidseattle/mui';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { CEProfile } from '../api/types';
import { ShowLocalTimeContext } from './ShowLocalTimeContext';
import { TimeWindowSelectionContext } from './TimeWindowSelectionContext';
import { UI_STRINGS } from '../constants';
interface ProfileContextType {
    profile: CEProfile,
    setProfile: React.Dispatch<React.SetStateAction<CEProfile>>
}

export const ProfileContext = createContext<ProfileContextType>({
    profile: {} as CEProfile,
    setProfile: () => { }
})

interface Props {
    title: string;
    tools: ReactNode,
    table: ReactNode,
}
const ProfilesPage: React.FC<Props> = ({ title, tools, table }) => {
    const [profile, setProfile] = useState<CEProfile>({} as CEProfile);
    const [selection, setSelection] = useState<string[]>([]);
    const [showLocalTime, setShowLocalTime] = useState<boolean>(false);

    return (
        <ProfileContext.Provider value={{ profile, setProfile }}>
            <TimeWindowSelectionContext.Provider value={{ selection, setSelection }}>
                <ShowLocalTimeContext.Provider value={{ showLocalTime, setShowLocalTime }}>
                    <Breadcrumbs>
                        <Link underline="hover" color="inherit" href="/">
                            {UI_STRINGS.HOME}
                        </Link>
                        <Typography color="text.primary">{title}</Typography>
                    </Breadcrumbs>
                    <MainCard title={title}>
                        {tools}
                        {table}
                    </MainCard>
                </ShowLocalTimeContext.Provider>
            </TimeWindowSelectionContext.Provider>
        </ProfileContext.Provider>
    )
};

export default ProfilesPage;
