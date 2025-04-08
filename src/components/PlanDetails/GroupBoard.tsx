
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useEffect, useState } from "react";

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
import { placementService } from "../../api/cePlacementService";
import { planGenerator } from "../../api/planGenerator";
import { Identifier, Placement } from "../../api/types";
import { PlanProps } from "../../utils/props";

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

export const GroupBoard: React.FC<PlanProps> = ({ plan }) => {
    const [placements, setPlacements] = useState<Placement[]>([]);
    const [categories, setCategories] = useState<DDCategory<string>[]>([]);
    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        setInitialized(false);
        if (plan) {
            placementService.findByPlanId(plan.id)
                .then(placements => {
                    const allGroups = placements
                        .filter(placement => placement.group !== null)
                        .map(placement => placement.group);
                    const groupIds = Array.from(new Set(allGroups.map(group => group!.id)));
                    const groupCategories = groupIds
                        .map(groupId => {
                            const found = allGroups.find(group => group!.id === groupId)!;
                            return { label: found.name, value: found.id! as string }
                        })
                        .sort((cat0, cat1) => cat0.label.localeCompare(cat1.label));
                    setCategories(groupCategories);
                    setPlacements(placements);
                    setInitialized(true);
                })
        }
    }, [plan])

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
        return (
            <Box>
                <Typography variant="h6">Group: {cat.label}</Typography>
            </Box>
        )
    };

    function seedGroups(): void {
        planGenerator.seedPlan(plan)
            .then((updated) => console.log(updated))
            .catch((err) => console.error(err));
    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <Button
                    color="primary"
                    variant="contained"
                    onClick={seedGroups}
                >
                    Seed (WIP)
                </Button>
                <>{initialized &&
                    <DragAndDrop
                        onChange={(container: Map<string, unknown>, placement: Placement) => handleChange(container, placement)}
                        items={placements}
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
