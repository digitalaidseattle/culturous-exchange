/**
 *  NewPlanDialog.tsx
 *
 *  The "Create New Plan" window, opened from the cohort page and the cohort cards. Its contents,
 *  the settings and the preview, are the NewPlanPanel, which the Create Cohort window uses too.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Dialog } from "@mui/material";
import { useState } from "react";
import { Cohort } from "../api/types";
import { NewPlanPanel } from "./NewPlanPanel";

export const NewPlanDialog = (props: { cohort: Cohort, open: boolean, onClose: () => void }) => {
    const { cohort, open, onClose } = props;
    const [busy, setBusy] = useState<boolean>(false);

    // the panel's settings go when the window closes, because the window removes the panel then
    return (
        <Dialog
            open={open}
            // do not close the window while the plan is being made
            onClose={busy ? undefined : onClose}
            fullWidth
            maxWidth="md">
            <NewPlanPanel cohort={cohort} onClose={onClose} onBusyChange={setBusy} />
        </Dialog>
    );
};
