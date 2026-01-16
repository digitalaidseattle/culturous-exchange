import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui

// project import
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { MainCard } from '@digitalaidseattle/mui';
import { UI_STRINGS } from '../../constants';
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
                <MainCard contentSX={{
                    background: 'linear-gradient(95deg,rgb(37, 184, 252) 100% ,rgb(7, 109, 44) 50%)',
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: 3
                }}>
                    <Typography variant='h2'>{UI_STRINGS.CURRENT_COHORT} {current.name}</Typography>
                    <Stack direction='row' justifyContent='space-between' >
                        <Stack direction='row' gap={2}>
                            <Card >
                                <CardContent onClick={() => navigate(`/cohort/${current.id}?tab=1`)}>
                                    <Typography>{UI_STRINGS.STUDENTS_LABEL}: {current.enrollments.length}</Typography>
                                </CardContent>
                            </Card>
                            <Card >
                                <CardContent onClick={() => navigate(`/cohort/${current.id}?tab=0`)}>
                                    <Typography>{UI_STRINGS.PLANS_LABEL}: {current.plans.length}</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                        <Button variant='contained' onClick={() => navigate(`/cohort/${current.id}`)}>{UI_STRINGS.OPEN}</Button>
                    </Stack>
                </MainCard>
            }
        </Stack >
    )
};

export default HomePage;
