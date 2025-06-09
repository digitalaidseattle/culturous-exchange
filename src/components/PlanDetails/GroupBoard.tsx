
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { CalculatorOutlined, ClockCircleOutlined, ExperimentOutlined, ExportOutlined, StarFilled, UserOutlined } from "@ant-design/icons";
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Stack,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";

import { format } from "date-fns";
import { DDCategory, DDType, DragAndDrop } from '@digitalaidseattle/draganddrop';

import { Group, Identifier, Placement } from "../../api/types";
import { placementService } from "../../api/cePlacementService";
import { planEvaluator } from "../../api/planEvaluator";
import { planGenerator } from "../../api/planGenerator";
import { PlanContext } from "../../pages/plan";
import "@digitalaidseattle/draganddrop/dist/draganddrop.css";

export const StudentCard: React.FC<{ placement: Placement, showDetails: boolean }> = ({ placement, showDetails }) => {

    const anchor = placement.anchor ? 'green' : 'gray;';
    const timeWindows = placement.student!.timeWindows ? placement.student!.timeWindows ?? [] : [];

    return (placement &&
        <div id={`${placement.plan_id}.${placement.student_id}`} >
            <Card key={placement.student_id} sx={{ pointerEvents: 'auto', margin: 0 }}>
                <CardContent>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        {
                            placement.anchor &&
                            <StarFilled style={{ fontSize: '150%', color: anchor }} />
                        }
                        <Typography fontWeight={600}>{placement.student!.name}</Typography>
                    </Stack>
                    <Typography>{placement.student!.country}</Typography>
                    {showDetails &&
                        <CardContent>
                            <Typography fontWeight={600}>Time Windows</Typography>
                            {timeWindows.map(tw => <Typography>{tw.day_in_week} {format(tw.start_date_time!, "haaa")} - {format(tw.end_date_time!, "haaa")}</Typography>)}
                        </CardContent>
                    }
                </CardContent>
            </Card>
        </div>
    );
}

export const GroupCard: React.FC<{ group: Group, showDetails: boolean }> = ({ group, showDetails }) => {
    const timeWindows = group ? group.time_windows ?? [] : [];
    return (group &&
        <Card sx={{ alignContent: "top" }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600}>{group.name}</Typography>
            </CardContent>
            {showDetails &&
                <>
                    <CardContent>
                        <Stack direction={'row'} spacing={1} >
                            <Typography fontWeight={600}>Countries: </Typography>
                            <Typography>{group.country_count}</Typography>
                        </Stack>
                    </CardContent>
                    <CardContent>
                        <Typography fontWeight={600}>Time Windows</Typography>
                        {timeWindows.map(tw => <Typography>{tw.day_in_week} {format(tw.start_date_time!, "haaa")} - {format(tw.end_date_time!, "haaa")}</Typography>)}
                    </CardContent>
                </>
            }
        </Card>
    );
}
type PlacementWrapper = Placement & DDType

export const GroupBoard: React.FC = () => {
    const { plan, setPlan } = useContext(PlanContext);

    const [categories, setCategories] = useState<DDCategory<string>[]>([]);
    const [placementWrappers, setPlacementWrappers] = useState<PlacementWrapper[]>([]);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [showGroupDetails, setShowGroupDetails] = useState<boolean>(false);
    const [showStudentDetails, setStudentDetails] = useState<boolean>(false);

    useEffect(() => {
        if (plan && !initialized) {
            setPlacementWrappers(plan.placements
                .map(placement => {
                    return {
                        ...placement,
                        id: `${placement.plan_id}:${placement.student_id}`,
                    } as PlacementWrapper
                }));
            setCategories(plan.groups
                .map(group => {
                    return { label: group.name, value: group.id! as string }
                })
                .sort((cat0, cat1) => cat0.label.localeCompare(cat1.label)));
            setInitialized(true);
        }
    }, [plan, initialized])

    function handleChange(container: Map<string, unknown>, placement: Placement) {
        const newGroupId = container.get('containerId') as Identifier;
        // find old group; iterate over groups looking for the student
        placementService
            .updatePlacement(placement.plan_id, placement.student_id, { group_id: newGroupId })
            .then(resp => console.log(resp))
    }

    function isCategory(item: PlacementWrapper, category: DDCategory<any>): boolean {
        // console.log('isCategory', item, category);
        return category.value === item.group_id;
    }

    function cellRender(item: PlacementWrapper): ReactNode {
        return <StudentCard placement={item} showDetails={showStudentDetails} />
    }

    const headerRenderer = (cat: DDCategory<string>): ReactNode => {
        const group = plan.groups.find(g => g.id === cat.value);
        return (group &&
            <GroupCard group={group} showDetails={showGroupDetails} />
        )
    };

    function seedGroups(): void {
        planGenerator.seedPlan(plan)
            .then((seeded) => {
                setPlan(seeded);
                setInitialized(false);
            })
            .catch((err) => console.error(err));
    }

    function calculate(): void {
        planEvaluator.evaluate(plan)
            .then(evaluated => {
                setShowGroupDetails(true);
                setPlan(evaluated);
                setInitialized(false)
            })
            .catch((err) => console.error(err));
    }

    function exportPlan(): void {
        alert('plan export not implemented yet');
    }

    function handleGroupDetails(): void {
        setShowGroupDetails(!showGroupDetails);
    }

    function handleStudentDetails(): void {
        setStudentDetails(!showStudentDetails);
    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <Toolbar>

                    <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                        Groups
                    </Typography>

                    <Tooltip title="Seed groups">
                        <IconButton color="inherit" onClick={seedGroups}>
                            <ExperimentOutlined />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Calculate plan">
                        <IconButton color="inherit" onClick={calculate}>
                            <CalculatorOutlined />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export plan">
                        <IconButton color="inherit" onClick={exportPlan}>
                            <ExportOutlined />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Toggle group details">
                        <IconButton color="inherit" onClick={handleGroupDetails}>
                            <UserOutlined />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Toggle student details">
                        <IconButton color="inherit" onClick={handleStudentDetails}>
                            <ClockCircleOutlined />
                        </IconButton>
                    </Tooltip>

                </Toolbar>
                <>{initialized &&
                    <DragAndDrop
                        onChange={(container: Map<string, unknown>, placement: Placement) => handleChange(container, placement)}
                        items={placementWrappers}
                        categories={categories}
                        isCategory={isCategory}
                        cardRenderer={cellRender}
                        headerRenderer={headerRenderer}
                    />}
                    {!plan &&
                        <Typography>No plan found.</Typography>
                    }
                </>
            </Box>
        </>
    )
};
