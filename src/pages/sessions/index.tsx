
// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';
import SessionsTable from './SessionsTable';

// ================================|| 404 ||================================ //

const SessionsPage: React.FC = () => {

    return (
        <MainCard title="Session Page">
            <SessionsTable />
        </MainCard>
    )
};

export default SessionsPage;
