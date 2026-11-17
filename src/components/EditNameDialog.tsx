/**
 *  EditNameDialog.tsx
 *
 *  A small "edit the name" window with Save and Cancel. Save is only available when
 *  the name is not blank and is different from the current name (extra spaces around
 *  the name are ignored and not saved). Used for renaming cohorts and plans.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import { useContext, useState } from "react";
import { UI_STRINGS } from "../constants";

interface Props {
    title: string;
    label: string;
    /** the current name */
    name: string;
    open: boolean;
    onClose: () => void;
    /** saves the new, trimmed name; throw to report that it failed */
    onSave: (name: string) => Promise<void>;
    /** the start of the message shown when saving fails */
    errorMessage: string;
}

export const EditNameDialog = ({ title, label, name, open, onClose, onSave, errorMessage }: Props) => {
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);

    // null means the field has not been edited, so it shows the current name
    const [draftName, setDraftName] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    const shown = draftName ?? name;
    const trimmed = shown.trim();
    const canSave = trimmed.length > 0 && trimmed !== name && !saving;

    const doSave = async () => {
        if (!canSave) {
            return;
        }
        setSaving(true);
        try {
            await onSave(trimmed);
            onClose();
            setRefresh(refresh + 1);
        } catch (error) {
            console.error(errorMessage, error);
            notifications.error(`${errorMessage} ${error instanceof Error ? error.message : error}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            // forget the draft only after the window has finished closing
            slotProps={{ transition: { onExited: () => setDraftName(null) } }}>
            <form onSubmit={(event) => { event.preventDefault(); doSave(); }}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        margin="dense"
                        label={label}
                        value={shown}
                        onChange={(event) => setDraftName(event.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{UI_STRINGS.CANCEL}</Button>
                    <Button type="submit" variant="contained" disabled={!canSave}>
                        {UI_STRINGS.SAVE}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
