
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { ExportOutlined, SettingOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
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

import { DDCategory, DDType, DragAndDrop } from '@digitalaidseattle/draganddrop';
import { format } from "date-fns";

import { useNotifications } from "@digitalaidseattle/core";
import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { placementService } from "../../api/cePlacementService";
import { planExporter } from "../../api/planExporter";
import { planGenerator } from "../../api/planGenerator";
import { Group, Identifier, Placement, Plan } from "../../api/types";
import PlanSettingsDialog from "../../components/PlanSettingsDialog";
import { StudentCard } from "../../components/StudentCard";
import { planService } from "../../api/cePlanService";
import { PlanContext } from "./PlanContext";

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
            const temCats: DDCategory<string>[] = plan.groups
                .map(group => {
                    return { label: group.name, value: group.id! as string }
                })
                .sort((cat0, cat1) => cat0.label.localeCompare(cat1.label))

            const placementMap = new Map();
            temCats.forEach(category => {
                placementMap.set(category, plan.placements
                    .filter(placement => category.value === placement.group_id)
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
        const newGroupId = container.get('containerId') as Identifier;
        // find old group; iterate over groups looking for the student
        placementService
            .updatePlacement(placement.plan_id, placement.student_id, { group_id: newGroupId })
            .then(resp => console.log(resp))
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
                    notifications.success(`${plan.name} exported successfully`);
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
        planService.update(plan.id,
            {
                group_size: plan.group_size!
            })
            .then(updatedPlan => {
                planGenerator.hydratePlan(updatedPlan.id!)
                    .then((hydratedPlan) => {
                        planGenerator.seedPlan(hydratedPlan)
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
                    .catch((error) => {
                        notifications.error(`Failed to rehydrate plan: ${error.message}`);
                        throw error;
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
                plan={plan}
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSubmit={handleSettingsChange}
            />
        </>
    )
};
