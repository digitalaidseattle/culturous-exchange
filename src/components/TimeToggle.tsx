/**
 *  TimeToggle.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useContext } from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import { CheckOutlined } from '@ant-design/icons';
import { ShowLocalTimeContext } from './ShowLocalTimeContext';
import { UI_STRINGS } from '../constants';

export const TimeToggle: React.FC = () => {
    const { showLocalTime, setShowLocalTime } = useContext(ShowLocalTimeContext);

    return (
        <ButtonGroup sx={{ justifyContent: "flex-end" }}
            variant="contained" aria-label="Time zone selection">
            <Button
                disabled={showLocalTime}
                startIcon={showLocalTime ? < CheckOutlined /> : <Box sx={{ width: 24, height: 24 }} />}
                onClick={() => setShowLocalTime(true)}>{UI_STRINGS.LOCAL_TIME}</Button>
            <Button
                disabled={!showLocalTime}
                startIcon={!showLocalTime ? <CheckOutlined /> : <Box sx={{ width: 24, height: 24 }} />}
                onClick={() => setShowLocalTime(false)} >{UI_STRINGS.STUDENT_TIME}</Button>
        </ButtonGroup>
    )
}