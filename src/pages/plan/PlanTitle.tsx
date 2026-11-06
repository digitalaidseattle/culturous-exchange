/**
 * PlanTitle.tsx
 *
 *  The name of a plan as the page's heading, with a small "Name" label above it (an eyebrow) and a
 *  pencil to rename it in place.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import { IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { UI_STRINGS } from "../../constants";

export const PlanTitle: React.FC<{ name: string, onChange: (name: string) => void }> = ({ name, onChange }) => {
    const [editing, setEditing] = useState<boolean>(false);
    // only a scratch buffer: the heading shows `name` directly, and the buffer is seeded when editing starts
    const [text, setText] = useState<string>(name);

    const start = () => { setText(name); setEditing(true); };
    const cancel = () => setEditing(false);
    const save = () => {
        const trimmed = text.trim();
        if (trimmed && trimmed !== name) {
            onChange(trimmed);
        }
        setEditing(false);
    };

    return (
        <Stack gap={0.25}>
            <Typography variant="overline" component="p" color="text.secondary" sx={{ lineHeight: 1.5, fontWeight: 600 }}>
                {UI_STRINGS.NAME}
            </Typography>
            {editing
                ? <Stack direction="row" alignItems="center" gap={0.5}>
                    <TextField
                        autoFocus
                        variant="standard"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') { save(); }
                            if (event.key === 'Escape') { cancel(); }
                        }}
                        slotProps={{ htmlInput: { 'aria-label': UI_STRINGS.EDIT_NAME, sx: { fontSize: '1.5rem', fontWeight: 600 } } }}
                        sx={{ minWidth: 280 }} />
                    <IconButton size="small" color="error" aria-label="Cancel" onClick={cancel}><CloseCircleOutlined /></IconButton>
                    <IconButton size="small" color="success" aria-label="Save" onClick={save}><CheckCircleOutlined /></IconButton>
                </Stack>
                : <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h2" component="h1" sx={{ fontWeight: 600 }}>{name}</Typography>
                    <IconButton size="small" color="primary" aria-label={UI_STRINGS.EDIT_NAME} title={UI_STRINGS.EDIT_NAME} onClick={start}>
                        <EditOutlined />
                    </IconButton>
                </Stack>}
        </Stack>
    );
};
