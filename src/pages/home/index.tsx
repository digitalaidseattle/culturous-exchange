import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui

// project import
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { MainCard } from '@digitalaidseattle/mui';
import { cohortService } from '../../api/ceCohortService';
import { Cohort } from '../../api/types';


const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const [current, setCurrent] = useState<Cohort>();

    useEffect(() => {
        cohortService.getLatest()
            .then(c => { setCurrent(c!) })
    }, []);

    return (
        <Stack gap={1}>
            {current &&
                <MainCard>
                    <Typography variant='h2'>Current Cohort: {current.name}</Typography>
                    <Stack direction='row' justifyContent='space-between' >
                        <Stack direction='row' gap={2}>
                            <Card >
                                <CardContent onClick={() => navigate(`/cohort/${current.id}?tab=1`)}>
                                    <Typography>Students: {current.enrollments.length}</Typography>
                                </CardContent>
                            </Card>
                            <Card >
                                <CardContent onClick={() => navigate(`/cohort/${current.id}?tab=0`)}>
                                    <Typography>Plans: {current.plans.length}</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                        <Button variant='contained' onClick={() => navigate(`/cohort/${current.id}`)}>Open</Button>
                    </Stack>
                </MainCard>
            }
        </Stack>
    )
};

export default HomePage;
