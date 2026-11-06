/**
 * WelcomeBanner.tsx
 *
 * Introduces the home page: what the site is for and where to start.
 *
 * @copyright 2026 Digital Aid Seattle
 */
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { UI_STRINGS } from '../../constants';
import { raisedCardSx } from '../../utils/styles';

export const WelcomeBanner: React.FC = () => (
    <Card sx={{ ...raisedCardSx, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
        <CardContent>
            <Stack gap={1}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }}>
                    {UI_STRINGS.WELCOME_TITLE}
                </Typography>
                <Typography>{UI_STRINGS.WELCOME_DESCRIPTION}</Typography>
                <Typography>
                    <Typography component="span" sx={{ fontWeight: 600 }}>{UI_STRINGS.WELCOME_GET_STARTED}</Typography>
                    {' '}{UI_STRINGS.GET_STARTED_TEXT}
                </Typography>
            </Stack>
        </CardContent>
    </Card>
);
