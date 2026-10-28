/**
 *  CountryChip.tsx
 *
 *  A small outlined chip for a country: its flag emoji, the name, and how many
 *  students come from it in bold. Countries that are not recognized get a
 *  globe instead of a flag.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Chip } from "@mui/material";
import { UI_STRINGS } from "../constants";
import { UNKNOWN_COUNTRY_FLAG, countryFlag } from "../utils/countryFlag";

// text that screen readers read but nobody sees
const visuallyHiddenSx = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px'
} as const;

export const CountryChip: React.FC<{ country: string, count: number }> = ({ country, count }) => (
    <Chip
        size="small"
        variant="outlined"
        // room on the left so the flag is not squeezed against the edge
        sx={{ '& .MuiChip-icon': { marginLeft: '10px', marginRight: '-2px' } }}
        // the flag is decoration; a screen reader reads the name, the number, and the word "students"
        icon={<span aria-hidden="true" style={{ lineHeight: 1 }}>{countryFlag(country) ?? UNKNOWN_COUNTRY_FLAG}</span>}
        label={
            <>
                {country}
                <strong style={{ marginLeft: 6 }}>{count}</strong>
                <span style={visuallyHiddenSx}> {count === 1 ? UI_STRINGS.UNIT_STUDENT : UI_STRINGS.UNIT_STUDENTS}</span>
            </>
        } />
);
