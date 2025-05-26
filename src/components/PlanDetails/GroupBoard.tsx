
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { StarFilled } from "@ant-design/icons";
import { DDCategory, DDType, DragAndDrop } from '@digitalaidseattle/draganddrop';
import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import { format } from "date-fns";
import { placementService } from "../../api/cePlacementService";
import { planEvaluator } from "../../api/planEvaluator";
import { planGenerator } from "../../api/planGenerator";
import { Group, Identifier, Placement } from "../../api/types";
import { PlanContext } from "../../pages/plan";
import { planExporter } from "../../api/planExporter";
import { useNotifications } from "@digitalaidseattle/core";
import { timeWindowService } from "../../api/ceTimeWindowService";

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
                            {timeWindows.map(tw => <Typography>{timeWindowService.toString(tw)}</Typography>)}
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
                        {timeWindows.map(tw => <Typography>{timeWindowService.toString(tw)}</Typography>)}
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

    const notifications = useNotifications();

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

    function exportPlan(): void {
        planExporter.exportPlan(plan)
            .then((exported) => {
                if (exported) {
                    notifications.success('Plan exported successfully');
                } else {
                    notifications.error('Failed to export plan');
                }
            })
            .catch((err) => {
                console.error(err);
                notifications.error('Error exporting plan');
            });
    }

    function emptyPlan(): void {
        planGenerator.emptyPlan(plan)
            .then((emptied) => {
                setPlan(emptied);
                setInitialized(false);
                setShowGroupDetails(false);
            })
            .catch((err) => console.error(err));
    }

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

    function handleGroupDetails(): void {
        setShowGroupDetails(!showGroupDetails);
    }

    function handleStudentDetails(): void {
        setStudentDetails(!showStudentDetails);
    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <Stack direction={'row'} spacing={1} margin={1} >
                    <Typography variant="h5">Group Board</Typography>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={emptyPlan}
                    >
                        EMPTY (WIP)
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={seedGroups}
                    >
                        Seed (WIP)
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={calculate}>
                        Calculate (WIP)
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleGroupDetails}>
                        {showGroupDetails ? 'Hide Group Details' : 'Show Group Details'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleStudentDetails}>
                        {showStudentDetails ? 'Hide Student Details' : 'Show Student Details'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={exportPlan}>
                        Export Plan
                    </Button>
                </Stack>
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
