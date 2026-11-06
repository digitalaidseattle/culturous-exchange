/**
 * PlanNotes.tsx
 *
 *  A plan's notes as a text entry field that is always there to type in. Changes are saved when
 *  the field is left, or with Enter held with Command or Control.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { UI_STRINGS } from "../../constants";

export const PlanNotes: React.FC<{ note?: string | null, onChange: (note: string) => void }> = ({ note, onChange }) => {
    const [text, setText] = useState<string>(note ?? '');
    // follow the plan when it changes elsewhere, e.g. a refresh
    useEffect(() => { setText(note ?? ''); }, [note]);

    const save = () => {
        if (text !== (note ?? '')) {
            onChange(text);
        }
    };

    return (
        <Stack>
            <TextField
                label={UI_STRINGS.NOTES_LABEL}
                placeholder={UI_STRINGS.PLAN_NOTES_PLACEHOLDER}
                value={text}
                multiline
                minRows={2}
                maxRows={8}
                fullWidth
                onChange={(event) => setText(event.target.value)}
                onBlur={save}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        save();
                    }
                }} />
        </Stack>
    );
};
