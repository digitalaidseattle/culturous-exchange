
// material-ui

// project import
import { Typography } from '@mui/material';
import MainCard from '../../components/MainCard';
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
