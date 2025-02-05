
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
}
export const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => {
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </Box>
    );
}
