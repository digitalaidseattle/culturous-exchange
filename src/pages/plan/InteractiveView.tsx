
/**
 *  GroupBoard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useContext, useEffect, useMemo, useState } from "react";

import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { Box, Button, ButtonGroup, FormControl, Grid, InputLabel, Slider, Stack, Typography } from "@mui/material";

import { OPTIMIZATION_STYLES, UI_STRINGS } from '../../constants';
import { CEPlanService } from "../../services/plan/cePlanService";
import { PlanContext } from "./PlanContext";
import { Plan } from "../../api/types";
import { PlanGenerator } from "../../services/plan/planGenerator";
import { GroupBarChart } from "../../components/GroupBarChart";
import { LoadingContext } from "@digitalaidseattle/core";

export const InteractiveView: React.FC = () => {
    const planService = CEPlanService.getInstance();

    const { setLoading } = useContext(LoadingContext);
    const { plan, setPlan } = useContext(PlanContext);
    const [local, setLocal] = useState<Plan>();
    const [dirty, setDirty] = useState<boolean>(false);

    // Deep copy: the generator mutates placements, which must not leak into the context plan.
    useEffect(() => {
        setLocal(structuredClone(plan));
        setDirty(false);
    }, [plan])

    // Per-group stats for the charts, ordered by group name so all three charts line up.
    const groupStats = useMemo(() => {
        const groups = [...(local?.groups ?? [])]
            .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { numeric: true }));
        return {
            names: groups.map(g => g.name),
            overlaps: groups.map(g => g.duration ?? 0),
            students: groups.map(g => (g.placements ?? []).length),
            countries: groups.map(g => g.country_count ?? 0),
        };
    }, [local]);

    async function recalculate(changes: Partial<Plan>): Promise<void> {
        if (local) {
            // setLoading(true);
            const updated = await PlanGenerator.getInstance().calculate({ ...local, ...changes });
            setLocal(updated);
            setDirty(true);
            // setLoading(false);
        }
    }

    async function handleSizeChange(_event: Event, newValue: number | number[]): Promise<void> {
        await recalculate({ group_size: newValue as number });
    }

    async function handleOptimizationStyleChange(style: string): Promise<void> {
        if (local && local.optimization_style !== style) {
            await recalculate({ optimization_style: style });
        }
    }

    // calculate() deletes groups and clears assignments in the database,
    // so resetting must write the original plan back, not just restore local state.
    async function handleReset(): Promise<void> {
        setLoading(true);
        try {
            await planService.save(structuredClone(plan));
            setLocal(structuredClone(plan));
            setDirty(false);
        } catch (err) {
            console.error('Failed to reset plan', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(): Promise<void> {
        if (!local) return;
        setLoading(true);
        try {
            const saved = await planService.save(local);
            setPlan(saved);
        } catch (err) {
            console.error('Failed to save plan', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Stack gap={2}>
                <Grid container spacing={3}
                    sx={{
                        border: 1,
                        borderRadius: 1,
                        borderColor: (theme) =>
                            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                        '&:hover': { borderColor: 'text.primary' },
                        px: 2.5,
                        pt: 4.5,
                        pb: 0.5,
                    }}>
                    <Grid size={4} >
                        <FormControl sx={{ m: 1, minWidth: 120, width: '100%' }}>
                            <InputLabel
                                shrink
                                id="group-size-label"
                                sx={{ bgcolor: 'background.paper', px: 0.5 }}
                            >
                                {UI_STRINGS.GROUP_SIZE}
                            </InputLabel>
                            <Box
                                sx={{
                                    borderRadius: 1,
                                    borderColor: (theme) =>
                                        theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                                    '&:hover': { borderColor: 'text.primary' },
                                    px: 2.5,
                                    pt: 4.5,
                                    pb: 0.5,
                                }}
                            >
                                <Slider
                                    aria-labelledby="group-size-label"
                                    value={local ? local.group_size : 10}
                                    step={1}
                                    min={5}
                                    max={15}
                                    valueLabelDisplay="on"
                                    marks={true}
                                    onChange={handleSizeChange}
                                />
                            </Box>
                        </FormControl>
                    </Grid>
                    <Grid size={4} >
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel
                                shrink
                                id="optimization-style-label"
                                sx={{ bgcolor: 'background.paper', px: 0.5 }}
                            >
                                {UI_STRINGS.GENERATION_METHOD}
                            </InputLabel>
                            <ButtonGroup
                                aria-labelledby="optimization-style-label"
                                sx={{ mt: 3 }}
                            >
                                {OPTIMIZATION_STYLES.map(option => (
                                    <Button
                                        key={option.value}
                                        variant={(local?.optimization_style ?? 'largest_first') === option.value ? 'contained' : 'outlined'}
                                        onClick={() => handleOptimizationStyleChange(option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </FormControl>
                    </Grid>
                    <Grid size={4} >
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ m: 1, mt: 3 }}>
                            <Button variant="outlined" disabled={!dirty} onClick={handleReset}>
                                {UI_STRINGS.RESET}
                            </Button>
                            <Button variant="contained" disabled={!dirty} onClick={handleSave}>
                                {UI_STRINGS.SAVE}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>

                <Grid container spacing={3}
                    sx={{
                        border: 1,
                        borderRadius: 1,
                        borderColor: (theme) =>
                            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                        '&:hover': { borderColor: 'text.primary' },
                        px: 2.5,
                        pt: 4.5,
                        pb: 0.5,
                    }}>
                    <Grid size={2} >
                        {local && <Stack>
                            <Typography>{UI_STRINGS.GROUPS_LABEL}: {(local.groups ?? []).length}</Typography>
                            <Typography>{UI_STRINGS.STUDENTS_LABEL}: {(local.placements ?? []).length}</Typography>
                            <Typography>{UI_STRINGS.WAITLISTED}: {(planService.getWaitlisted(local)).length}</Typography>
                            <Typography>{UI_STRINGS.TOTAL_DURATION}: {local.total_duration}</Typography>
                            <Typography>{UI_STRINGS.AVG_COUNTRY_COUNT}: {local.avg_country_count}</Typography>
                            <Typography>{UI_STRINGS.AVG_DURATION}: {local.avg_duration}</Typography>
                        </Stack>
                        }
                    </Grid>
                    <Grid size={5} >
                        <GroupBarChart
                            title={UI_STRINGS.GROUP_OVERLAP_CHART}
                            names={groupStats.names}
                            series={[{ data: groupStats.overlaps, label: "Hours" }]} />
                    </Grid>
                    <Grid size={5} >
                        <GroupBarChart
                            title={UI_STRINGS.GROUP_STUDENTS_COUNTRIES_CHART}
                            names={groupStats.names}
                            series={[
                                { data: groupStats.students, label: UI_STRINGS.STUDENTS_LABEL },
                                { data: groupStats.countries, label: "Countries" },
                            ]} />
                    </Grid>
                </Grid>
            </Stack>
        </>
    )
};
