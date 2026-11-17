/**
 *  EditCohortNameDialog.tsx
 *
 *  "Edit Cohort Name" window. See EditNameDialog for when Save is available.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useNotifications } from "@digitalaidseattle/core";
import { CECohortDao } from "../api/ceCohortDao";
import { Cohort } from "../api/types";
import { UI_STRINGS } from "../constants";
import { EditNameDialog } from "./EditNameDialog";

export const EditCohortNameDialog = (props: { cohort: Cohort, open: boolean, onClose: () => void }) => {
    const { cohort, open, onClose } = props;
    const notifications = useNotifications();

    return (
        <EditNameDialog
            title={UI_STRINGS.EDIT_COHORT_NAME}
            label={UI_STRINGS.COHORT_NAME_LABEL}
            name={cohort.name}
            open={open}
            onClose={onClose}
            errorMessage="Could not update cohort name."
            onSave={async (name) => {
                const updated = await CECohortDao.getInstance().update(cohort.id!, { name });
                notifications.success(`Cohort ${updated.name} updated.`);
            }} />
    );
};
