
/**
 *  GroupBoard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { Typography } from "@mui/material";

import "@digitalaidseattle/draganddrop/dist/draganddrop.css";

import { DDCategory, DDType, DragAndDrop } from "@digitalaidseattle/draganddrop";
import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { planService } from "../../api/cePlanService";
import { planEvaluator } from "../../api/planEvaluator";
import { Group, Identifier, Placement } from "../../api/types";
import { GroupCard } from "../../components/GroupCard";
import { StudentCard } from "../../components/StudentCard";
import { PlanContext } from "./PlanContext";

type PlacementWrapper = Placement & DDType

const WAITLIST_ID = 'WAITLIST';

export interface GroupBoardProps {
    showStudentDetails: boolean;
    showGroupDetails: boolean;
}
export const GroupBoard: React.FC<GroupBoardProps> = ({ showStudentDetails, showGroupDetails }) => {
    const { plan, setPlan } = useContext(PlanContext);

    const [categories, setCategories] = useState<DDCategory<string>[]>([]);
    const [placementWrappers, setPlacementWrappers] = useState<Map<DDCategory<string>, PlacementWrapper[]>>(new Map());
    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        // If plan is not defined, we don't want to initialize
        if (plan) {
            setInitialized(false);
            const waitlist: DDCategory<string>[] = [
                { label: 'Waitlisted', value: WAITLIST_ID }
            ];
            const temCats = waitlist.concat(plan.groups
                .map(group => {
                    return { label: group.name, value: group.id! as string }
                })
                .sort((cat0, cat1) => cat0.label.localeCompare(cat1.label)))

            const placementMap = new Map();
            temCats.forEach(category => {
                placementMap.set(category, plan.placements
                    .filter(placement => category.value === (placement.group_id ?? WAITLIST_ID))
                    .map(placement => {
                        return {
                            ...placement,
                            id: `${placement.plan_id}:${placement.student_id}`,
                        } as PlacementWrapper
                    })
                );
            });

            setPlacementWrappers(placementMap);
            setCategories(temCats);
            setInitialized(true);
        }
    }, [plan, initialized])

    function handleChange(container: Map<string, unknown>, placement: Placement) {
        if (plan) {

            const planPlacement = plan.placements.find(p => p.student_id === placement.student_id);
            if (planPlacement) {
                const newGroupId = container.get('containerId') as Identifier;
                const oldGroup = plan.groups.find(g => g.id === planPlacement.group_id);
                const newGroup = plan.groups.find(g => g.id === newGroupId);

                if (oldGroup && oldGroup.placements) {
                    const oldIndex = oldGroup.placements.findIndex(p => p.student_id === planPlacement.student_id);
                    oldGroup.placements.splice(oldIndex, 1);
                    // TODO  reorder / resequence group
                }

                if (newGroup && newGroup.placements) {
                    // TODO  reorder / resequence group
                    newGroup.placements.push(planPlacement)
                }
                planPlacement.group_id = newGroupId === WAITLIST_ID ? null : newGroupId;

                planEvaluator
                    .evaluate(plan)
                    .then(evaluated => {
                        planService
                            .save(evaluated)
                            .then((saved) => setPlan(saved))
                    })
            }
        }
    }

    function cellRender(item: PlacementWrapper): ReactNode {
        return <StudentCard placement={item} showDetails={showStudentDetails} />
    }

    const headerRenderer = (cat: DDCategory<string>): ReactNode => {
        const group = plan!.groups.find(g => g.id === cat.value);
        if (group) {
            return <GroupCard
                group={group}
                showDetails={showGroupDetails} />
        } else {
            return <GroupCard
                group={{ id: WAITLIST_ID, name: "Waitlisted" } as Group}
                showDetails={false} />
        }
    };



    return (
        <>
            {!plan &&
                <Typography>No plan found.</Typography>
            }
            {initialized &&
                <DragAndDrop
                    onChange={(container: Map<string, unknown>, placement: Placement) => handleChange(container, placement)}
                    items={placementWrappers}
                    categories={categories}
                    cardRenderer={cellRender}
                    headerRenderer={headerRenderer}
                />}
        </>
    )
};
