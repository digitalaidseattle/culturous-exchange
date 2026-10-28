
/**
 *  TabPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Box } from "@mui/material";

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    /** drop the side and bottom padding so content lines up with the page edge */
    disableGutters?: boolean;
}
export const TabPanel: React.FC<TabPanelProps> = ({ children, index, value, disableGutters }) => {
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && (
                <Box sx={disableGutters ? { pt: 3 } : { p: 3 }}>
                    {children}
                </Box>
            )}
        </Box>
    );
}
