
/**
 *  GroupBoard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { ExportOutlined, SettingOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
    Box,
    IconButton,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";

import "@digitalaidseattle/draganddrop/dist/draganddrop.css";

import { useNotifications } from "@digitalaidseattle/core";
import { DDCategory, DDType, DragAndDrop } from '@digitalaidseattle/draganddrop';
import { Group, Identifier, Placement, Plan } from "../../api/types";

import { planService } from "../../api/cePlanService";
import { planEvaluator } from "../../api/planEvaluator";
import { planExporter } from "../../api/planExporter";
import { planGenerator } from "../../api/planGenerator";
import { GroupCard } from "../../components/GroupCard";
import PlanSettingsDialog from "../../components/PlanSettingsDialog";
import { StudentCard } from "../../components/StudentCard";
import { PlanContext } from "./PlanContext";

type PlacementWrapper = Placement & DDType

const WAITLIST_ID = 'WAITLIST';

export const GroupBoard: React.FC = () => {
    const { plan, setPlan } = useContext(PlanContext);

    const [categories, setCategories] = useState<DDCategory<string>[]>([]);
    const [placementWrappers, setPlacementWrappers] = useState<Map<DDCategory<string>, PlacementWrapper[]>>(new Map());
    const [initialized, setInitialized] = useState<boolean>(false);
    const [showGroupDetails, setShowGroupDetails] = useState<boolean>(false);
    const [showStudentDetails, setStudentDetails] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const notifications = useNotifications();

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

    function exportPlan(): void {
        planExporter.exportPlan(plan!)
            .then((exported) => {
                if (exported) {
                    notifications.success(`${plan!.name} exported successfully`);
                } else {
                    notifications.error('Plan export failed');
                }
            })
    }

    function handleGroupDetails(): void {
        setShowGroupDetails(!showGroupDetails);
    }

    function handleStudentDetails(): void {
        setStudentDetails(!showStudentDetails);
    }

    function handleSettings(): void {
        setShowSettings(!showSettings);
    }

    function handleSettingsChange(plan: Plan): void {
        planService.update(plan.id, { group_size: plan.group_size! })
            .then(updatedPlan => {
                planGenerator.seedPlan(updatedPlan)
                    .then((seededPlan) => {
                        notifications.success(`Plan ${seededPlan.name} updated successfully`);
                        setInitialized(false)
                        setPlan(seededPlan);
                        setShowSettings(false);
                    })
                    .catch((error) => {
                        notifications.error(`Failed to update plan: ${error.message}`);
                    });
            })

    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <Toolbar>
                    <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                        Groups
                    </Typography>

                    <Tooltip title="Export plan">
                        <IconButton color="inherit" onClick={exportPlan}>
                            <ExportOutlined />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Toggle group details">
                        <IconButton color="inherit" onClick={handleGroupDetails}>
                            <TeamOutlined />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Toggle student details">
                        <IconButton color="inherit" onClick={handleStudentDetails}>
                            <UserOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Show plan settings">
                        <IconButton color="inherit" onClick={handleSettings}>
                            <SettingOutlined />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
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
            </Box>
            <PlanSettingsDialog
                plan={plan!}
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSubmit={handleSettingsChange}
            />
        </>
    )
};
