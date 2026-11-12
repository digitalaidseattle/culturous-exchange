/**
 * home/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui

// project import
import { Card, CardActionArea, CardHeader, Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { blue, green } from '@mui/material/colors';

import { EditOutlined } from '@ant-design/icons';
import { CECohortDao } from '../../api/ceCohortDao';
import { Cohort } from '../../api/types';
import { CountryChart } from '../../components/cohort_charts/CountryChart';
import { GenderChart } from '../../components/cohort_charts/GenderChart';
import { StudentAgeChart } from '../../components/cohort_charts/StudentAgeChart';
import { UI_STRINGS } from '../../constants';

export const CurrentCohortCard: React.FC = () => {

    const theme = useTheme();
    const cohortDao = CECohortDao.getInstance();

    const navigate = useNavigate();

    const [current, setCurrent] = useState<Cohort | null>();

    useEffect(() => {
        cohortDao.getLatest()
            .then(c => setCurrent(c))
    }, []);

    const countryData = useMemo(() => {
        const counts = new Set();
        (current?.enrollments ?? []).forEach(enrollment => {
            const country = enrollment.student?.country?.trim() || 'Unknown';
            counts.add(country);
        });
        return counts;
    }, [current]);

    return (current &&
        <Card>
            <CardHeader
                sx={{
                    background: `linear-gradient(to right, ${green[200]}, ${blue[900]})`,
                    color: theme.palette.common.white
                }}
                title={`${UI_STRINGS.CURRENT_COHORT} ${current.name}`}
                action={
                    <IconButton
                        sx={{ color: theme.palette.common.white }}
                        onClick={() => navigate(`/cohort/${current.id}`)}>
                        <EditOutlined />
                    </IconButton>
                }>
            </CardHeader>
            <Tooltip title={UI_STRINGS.CLICK_TO_OPEN}>
                <CardActionArea onClick={() => navigate(`/cohort/${current.id}`)}>
                    <Grid container m={2} spacing={1}>
                        <Grid size={3}>
                            <Typography>Number of {UI_STRINGS.STUDENTS_LABEL}:</Typography>
                        </Grid>
                        <Grid size={9}>
                            <Typography>{(current.enrollments ?? []).length}</Typography>
                        </Grid>
                        <Grid size={3}>
                            <Typography>Number of Countries:</Typography>
                        </Grid>
                        <Grid size={9}>
                            <Typography>{countryData.size}</Typography>
                        </Grid>
                        <Grid size={3}>
                            <Typography>Number of {UI_STRINGS.PLANS_LABEL}:</Typography>
                        </Grid>
                        <Grid size={9}>
                            <Typography> {(current.plans ?? []).length}</Typography>
                        </Grid>
                        <Grid size={5} mt={2}>
                            <Card>
                                <CardHeader title={`${UI_STRINGS.STUDENTS_LABEL} by Country`} />
                                <CountryChart cohort={current} />
                            </Card>
                        </Grid>
                        <Grid size={4} mt={2}>
                            <Card>
                                <CardHeader title={`${UI_STRINGS.STUDENTS_LABEL} by Age`} />
                                <StudentAgeChart cohort={current} />
                            </Card>
                        </Grid>
                        <Grid size={3} mt={2}>
                            <Card>
                                <CardHeader title={`${UI_STRINGS.STUDENTS_LABEL} by Gender`} />
                                <GenderChart cohort={current} />
                            </Card>
                        </Grid>
                    </Grid>
                </CardActionArea>
            </Tooltip>
        </Card>
    )
};
