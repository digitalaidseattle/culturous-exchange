/**
 *  App.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { MainCard } from '@digitalaidseattle/mui';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from "react";
import { TabPanel } from "../TabPanel";
import { TextEdit } from "../TextEdit";
import { GroupBoard } from "./GroupBoard";
import Setup from "./Setup";

export const PlanDetails = (props: { plan: Plan }) => {
    const [value, setValue] = useState<number>(0);
    const plan = props.plan;

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // TODO add breadcrumbs
    return (
        <MainCard sx={{ width: '100%' }}>
            
            <TextEdit label={'Name'} value={plan.name} onChange={(text: string) => alert(`TODO  save : ${text} name`)} />
            <TextEdit label={'Notes'} value={plan.notes} rows={2} onChange={(text: string) => alert(`TODO  note save : ${text}`)} />

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Setup" />
                    <Tab label="Grouping" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <Setup />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <GroupBoard plan={plan} />
            </TabPanel>
        </MainCard>
    );
}
