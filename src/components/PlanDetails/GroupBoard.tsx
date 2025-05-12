
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { ExclamationCircleFilled, StarFilled } from "@ant-design/icons";
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
import { Identifier, Placement } from "../../api/types";
import { PlanContext } from "../../pages/plan";

export const StudentCard: React.FC<{ placement: Placement }> = ({ placement }) => {
    const anchor = placement.anchor ? 'green' : 'gray;'
    const priority = placement.priority ? 'green' : 'gray;'
    return (
        placement &&
        <div id={`${placement.plan_id}.${placement.student_id}`} >
            <Card key={placement.student_id} sx={{ pointerEvents: 'auto', margin: 0 }}>
                <CardContent>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                            {placement.anchor &&
                                <StarFilled style={{ fontSize: '150%', color: anchor }} />
                            }
                            {placement.priority === 1 &&
                                <ExclamationCircleFilled style={{ fontSize: '150%', color: priority }} />
                            }
                        </Stack>
                        <Typography>{placement.student!.name}</Typography>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    );
}

type PlacementWrapper = Placement & DDType

export const GroupBoard: React.FC = () => {
    const { plan, setPlan } = useContext(PlanContext);

    const [categories, setCategories] = useState<DDCategory<string>[]>([]);
    const [placementWrappers, setPlacementWrappers] = useState<PlacementWrapper[]>([]);
    const [initialized, setInitialized] = useState<boolean>(false);

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
        return <StudentCard placement={item} />
    }

    const headerRenderer = (cat: DDCategory<string>): ReactNode => {
        const group = plan.groups.find(g => g.id === cat.value);
        const timeWindows = group ? group.time_windows ?? undefined : undefined;
        return (
            <Stack>
                <Typography variant="h6">Group: {cat.label}</Typography>
                {timeWindows && timeWindows.map(tw => <Typography>{tw.day_in_week} {format(tw.start_date_time!, "haaa")} - {format(tw.end_date_time!, "haaa")}</Typography>)}
            </Stack>
        )
    };

    function emptyPlan(): void {
        planGenerator.emptyPlan(plan)
            .then(() => setInitialized(false))
            .catch((err) => console.error(err));
    }

    function seedGroups(): void {
        planGenerator.seedPlan(plan)
            .then(() => setInitialized(false))
            .catch((err) => console.error(err));
    }

    function calculate(): void {
        planEvaluator.evaluate(plan)
            .then(evaluated => {
                setPlan(evaluated);
                setInitialized(false)
            })
            .catch((err) => console.error(err));
    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <Stack direction={'row'} spacing={1} >
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
