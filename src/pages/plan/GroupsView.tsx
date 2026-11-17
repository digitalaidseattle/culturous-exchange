/**
 *  GroupsView.tsx
 *
 *  The groups of a plan. Each group is a card, one under the next, and the page scrolls. The
 *  students who are not in a group are in a side panel. A student's three dot menu opens their
 *  details, or the Change group window.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useMemo, useState } from "react";

import { Box, Typography } from "@mui/material";

import { Identifier, RefreshContext, useNotifications } from "@digitalaidseattle/core";

import { Placement } from "../../api/types";
import { ChangeGroupDialog } from "../../components/ChangeGroupDialog";
import { PlanGroupCard } from "../../components/PlanGroupCard";
import { StudentDetailsDialog } from "../../components/StudentDetailsDialog";
import { WaitlistPanel } from "../../components/WaitlistPanel";
import { SERVICE_ERRORS, UI_STRINGS, WAITLIST_ID } from "../../constants";
import { CEPlacementService } from "../../services/cePlacementService";
import { CEPlanService } from "../../services/plan/cePlanService";
import { studentMover } from "../../services/plan/studentMover";
import { PlanContext } from "./PlanContext";

export const GroupsView: React.FC = () => {
    const planService = CEPlanService.getInstance();
    const placementService = CEPlacementService.getInstance();
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const { plan, setPlan } = useContext(PlanContext);

    const [detailsFor, setDetailsFor] = useState<Placement | null>(null);
    const [movingFor, setMovingFor] = useState<Placement | null>(null);

    const groups = useMemo(
        () => [...(plan.groups ?? [])].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
        [plan.groups]);
    const placements = (plan.placements ?? []).filter(placement => placement.student);
    const waitlisted = placements.filter(placement => !placement.group_id);

    // the dialogs show the student as the plan has them now, so a change made in one is seen at once
    const current = (placement: Placement | null) =>
        placement ? placements.find(p => p.student_id === placement.student_id) ?? placement : null;

    async function handleMove(placement: Placement, groupId: string): Promise<boolean> {
        try {
            const moved = await studentMover.run(plan, placement.student_id, groupId as Identifier);
            const saved = await planService.save(moved);
            setPlan(saved);
            const group = plan.groups.find(g => g.id === groupId);
            notifications.success(`${placement.student?.name} ${UI_STRINGS.STUDENT_MOVED} ${groupId === WAITLIST_ID ? UI_STRINGS.THE_WAITLIST : group?.name}.`);
            return true;
        } catch (error) {
            console.error(UI_STRINGS.STUDENT_MOVE_FAILED, error);
            notifications.error(`${UI_STRINGS.STUDENT_MOVE_FAILED} ${error instanceof Error ? error.message : ''}`.trim());
            return false;
        }
    }

    // changes the plan in place first, so the card does not wait for the database; puts it back if saving fails
    async function handleToggleAnchor(placement: Placement) {
        const original = plan;
        const updated = {
            ...plan,
            placements: plan.placements.map(p =>
                p.plan_id === placement.plan_id && p.student_id === placement.student_id ? { ...p, anchor: !p.anchor } : p)
        };
        try {
            setPlan(updated);
            await placementService.updatePlacement(placement.plan_id, placement.student_id, { anchor: !placement.anchor });
        } catch (error) {
            setPlan(original);
            console.error(SERVICE_ERRORS.ERROR_TOGGLING_ANCHOR, error);
            setRefresh(refresh + 1);
        }
    }

    const detailsPlacement = current(detailsFor);
    const detailsGroup = detailsPlacement ? plan.groups.find(g => g.id === detailsPlacement.group_id) : undefined;

    return (
        <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' }, gap: 3, alignItems: 'start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    {groups.length === 0 && <Typography color="text.secondary">{UI_STRINGS.NO_GROUPS_IN_PLAN}</Typography>}
                    {groups.map(group =>
                        <PlanGroupCard
                            key={group.id}
                            group={group}
                            placements={placements.filter(placement => placement.group_id === group.id)}
                            onSeeDetails={setDetailsFor}
                            onChangeGroup={setMovingFor}
                            onToggleAnchor={handleToggleAnchor} />
                    )}
                </Box>
                <WaitlistPanel
                    placements={waitlisted}
                    onSeeDetails={setDetailsFor}
                    onChangeGroup={setMovingFor}
                    onToggleAnchor={handleToggleAnchor} />
            </Box>
            <StudentDetailsDialog
                placement={detailsPlacement}
                groupName={detailsGroup?.name}
                onClose={() => setDetailsFor(null)} />
            <ChangeGroupDialog
                plan={plan}
                placement={current(movingFor)}
                onClose={() => setMovingFor(null)}
                onMove={handleMove} />
        </>
    );
};
