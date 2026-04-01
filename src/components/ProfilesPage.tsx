/**
 *  ProfilePage.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { createContext, ReactNode, useState } from 'react';

import { MainCard } from '@digitalaidseattle/mui';
import { Breadcrumbs, IconButton, Link, Typography } from '@mui/material';
import { CEProfile } from '../api/types';
import { ShowLocalTimeContext } from './ShowLocalTimeContext';
import { TimeWindowSelectionContext } from './TimeWindowSelectionContext';
import { HomeOutlined } from '@ant-design/icons';
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
                    <Breadcrumbs aria-label="breadcrumb">
                        <IconButton LinkComponent={Link} href="/" size="medium" aria-label="home">
                            <HomeOutlined />
                        </IconButton>
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
