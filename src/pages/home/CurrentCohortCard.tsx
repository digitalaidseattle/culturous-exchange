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
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

import { CECohortDao } from '../../api/ceCohortDao';
import { Cohort } from '../../api/types';
import { UI_STRINGS } from '../../constants';
import { EditOutlined } from '@ant-design/icons';

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
        const counts = new Map<string, number>();
        (current?.enrollments ?? []).forEach(enrollment => {
            const country = enrollment.student?.country?.trim() || 'Unknown';
            counts.set(country, (counts.get(country) ?? 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([country, count], id) => ({ id, label: country, value: count }));
    }, [current]);

    const genderData = useMemo(() => {
        const counts = new Map<string, number>();
        (current?.enrollments ?? []).forEach(enrollment => {
            const gender = enrollment.student?.gender?.trim() || 'Unknown';
            counts.set(gender, (counts.get(gender) ?? 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([gender, count], id) => ({ id, label: gender, value: count }));
    }, [current]);

    const ageData = useMemo(() => {
        const counts = new Map<number, number>();
        (current?.enrollments ?? []).forEach(enrollment => {
            const age = enrollment.student?.age;
            if (age != null) {
                counts.set(age, (counts.get(age) ?? 0) + 1);
            }
        });
        const ages = Array.from(counts.keys()).sort((a, b) => a - b);
        return { ages, counts: ages.map(age => counts.get(age)!) };
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
                    <Grid container m={2}>
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
                            <Typography>{countryData.length}</Typography>
                        </Grid>
                        <Grid size={3}>
                            <Typography>Number of {UI_STRINGS.PLANS_LABEL}:</Typography>
                        </Grid>
                        <Grid size={9}>
                            <Typography> {(current.plans ?? []).length}</Typography>
                        </Grid>
                        {countryData.length > 0 &&
                            <Grid size={6} mt={2}>
                                <Typography>{UI_STRINGS.STUDENTS_LABEL} by Country:</Typography>
                                <PieChart
                                    series={[{ data: countryData, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
                                    height={240}
                                    slotProps={{
                                        legend: {
                                            direction: 'vertical',
                                            sx: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, auto)',
                                                columnGap: 2,
                                                rowGap: 1
                                            }
                                        }
                                    }}
                                />
                                {/* <Typography variant="body2" color="text.secondary" align="center">
                                    Total countries: {countryData.length}
                                </Typography> */}
                            </Grid>
                        }
                        {ageData.ages.length > 0 &&
                            <Grid size={6} mt={2}>
                                <Typography>{UI_STRINGS.STUDENTS_LABEL} by Age:</Typography>
                                <BarChart
                                    xAxis={[{ data: ageData.ages, scaleType: 'band', label: 'Age' }]}
                                    yAxis={[{ tickMinStep: 1 }]}
                                    series={[{ data: ageData.counts, label: UI_STRINGS.STUDENTS_LABEL }]}
                                    height={240}
                                    hideLegend
                                />
                            </Grid>
                        }
                        {genderData.length > 0 &&
                            <Grid size={6} mt={2}>
                                <Typography>{UI_STRINGS.STUDENTS_LABEL} by Gender:</Typography>
                                <PieChart
                                    series={[{ data: genderData, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
                                    height={240}
                                />
                            </Grid>
                        }
                    </Grid>
                </CardActionArea>
            </Tooltip>
        </Card>
    )
};
