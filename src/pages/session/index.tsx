
// material-ui

// project import
import { Box, Button, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { sessionService } from '../../api/ceSessionService';
import MainCard from '../../components/MainCard';
import { GroupBoard } from './GroupBoard';
import StudentsTable from './StudentsTable';

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

const PlanCard = (props: { plan: Plan }) => {
    const [value, setValue] = useState<number>(0);
    const plan = props.plan;

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Setup" {...a11yProps(0)} />
                    <Tab label="Grouping" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <TextField id="outlined-basic" label="Number of Groups" variant="outlined" />
                <Box sx={{ marginTop: 1 }}>
                    <StudentsTable />
                </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Button variant='contained' onClick={() => alert('Placing Students')}>Place Students</Button>
                <Box sx={{ marginTop: 1 }}  >
                    <GroupBoard plan={plan} />
                </Box>
            </CustomTabPanel>
        </Box>
    );
}

const SessionPage: React.FC = () => {
    const { id: sessionId } = useParams<string>();
    const [session, setSession] = useState<Session>();
    useEffect(() => {
        if (sessionId) {
            sessionService.getById(sessionId)
                .then(session => setSession(session))
        }
    }, [sessionId])
    return (session &&
        <Stack gap={1}>
            <MainCard title="Session Page" >
                <Stack direction={'row'} gap={1} >
                    <Typography fontWeight={700}>Dates:</Typography>
                    <DatePicker
                        label="Start"
                        value={session.startDate}
                        onChange={(newValue) => alert(newValue)}
                    />
                    <DatePicker
                        label="End"
                        value={session.endDate}
                        onChange={(newValue) => alert(newValue)}
                    />
                </Stack>
                <Button sx={{ marginTop: 1 }} variant="contained" onClick={() => alert('A plan would be added.')}>New Plan</Button>
            </MainCard>
            {session.plans.map(plan =>
                <MainCard title={plan.name}>
                    <PlanCard plan={plan} />
                </MainCard>
            )}
        </Stack>
    )
};

export default SessionPage;
