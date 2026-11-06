/**
 * home/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */


// material-ui

// project import
import { Grid } from '@mui/material';

import { CurrentCohortCard } from './CurrentCohortCard';
import { GetStartedCard } from './GetStartedCard';

const HomePage: React.FC = () => {

    return (
        <Grid >
            <Grid size={6} m={1}>
                <GetStartedCard />
            </Grid>
            <Grid size={6} m={1}>
                <CurrentCohortCard />
            </Grid>
        </Grid >
    )
};

export default HomePage;
