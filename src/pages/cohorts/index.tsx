
// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';
import CohortsTable from './CohortsTable';

// ================================|| 404 ||================================ //

const CohortsPage: React.FC = () => {

    return (
        <MainCard title="Cohorts">
            <CohortsTable />
        </MainCard>
    )
};

export default CohortsPage;
