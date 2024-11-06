
// material-ui

// project import
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import MainCard from '../../components/MainCard';
import { useState } from 'react';
import { GroupBoard } from './GroupBoard';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const TEST_PLAN: Plan = {
    id: '',
    planSpecId: '',
    planSpec: {
        id: '',
        sessionId: '',
        numberOfGroups: 6,
        enrollments: [
            {
                id: '1',
                studentId: 's1',
                student: {
                    id: '',
                    name: 'Student 1',
                    email: '',
                    city: '',
                    state: '',
                    country: '',
                    availabilities: []
                },
                anchor: true,
                availabilities: []
            },
            {
                id: '2',
                studentId: 's2',
                student: {
                    id: '',
                    name: 'Student 2',
                    email: '',
                    city: '',
                    state: '',
                    country: '',
                    availabilities: []
                },
                anchor: false,
                availabilities: []
            },
            {
                id: '3',
                studentId: 's3',
                student: {
                    id: '',
                    name: 'Student 3',
                    email: '',
                    city: '',
                    state: '',
                    country: '',
                    availabilities: []
                },
                anchor: false,
                availabilities: []
            }
        ]
    },
    groups: [
        {
            id: undefined,
            groupNo: 'Group 1',
            studentIds: ['s1']
        },
        {
            id: undefined,
            groupNo: 'Group 2',
            studentIds: ['s2', 's3']
        },
        {
            id: undefined,
            groupNo: 'Group 3',
            studentIds: []
        }
    ],
    rating: 10,
    messages: []
}
const BasicTabs = () => {
    const [value, setValue] = useState<number>(0);
    const plan: Plan | undefined = TEST_PLAN;

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Specs" {...a11yProps(0)} />
                    <Tab label="Students" {...a11yProps(1)} />
                    <Tab label="Grouping" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <Typography>Dates</Typography>
                <Typography>Number of Groups</Typography>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Typography>Table of Students</Typography>
                <Typography>Function to add all available students</Typography>
                <Typography>Specify Anchors</Typography>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <Typography>Allow adding/removing students in/out of session</Typography>
                <GroupBoard plan={plan} />
            </CustomTabPanel>
        </Box>
    );
}

const SessionPage: React.FC = () => {

    return (
        <Stack gap={1}>
            <MainCard title="Session Page">
                <Typography>List of Plans</Typography>
                <Typography>Duplicate function</Typography>
                <Typography>Export function</Typography>
            </MainCard>
            <MainCard title="Plan 1">
                <Typography>Generate plan function</Typography>
                <Typography>Plan error messages</Typography>
                <Typography>Plan score?</Typography>
                <BasicTabs />
            </MainCard>
        </Stack>
    )
};

export default SessionPage;
