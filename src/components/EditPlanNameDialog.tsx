/**
 *  EditPlanNameDialog.tsx
 *
 *  "Edit Plan Name" window. See EditNameDialog for when Save is available.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useNotifications } from "@digitalaidseattle/core";
import { CEPlanDao } from "../api/cePlanDao";
import { Plan } from "../api/types";
import { UI_STRINGS } from "../constants";
import { EditNameDialog } from "./EditNameDialog";

export const EditPlanNameDialog = (props: { plan: Plan, open: boolean, onClose: () => void }) => {
    const { plan, open, onClose } = props;
    const notifications = useNotifications();

    return (
        <EditNameDialog
            title={UI_STRINGS.EDIT_PLAN_NAME}
            label={UI_STRINGS.PLAN_NAME_LABEL}
            name={plan.name}
            open={open}
            onClose={onClose}
            errorMessage="Could not update plan name."
            onSave={async (name) => {
                const updated = await CEPlanDao.getInstance().update(plan.id!, { name });
                notifications.success(`Plan ${updated.name} updated.`);
            }} />
    );
};
