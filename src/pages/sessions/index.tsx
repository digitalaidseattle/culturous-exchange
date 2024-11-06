
// material-ui

// project import
import { Typography } from '@mui/material';
import MainCard from '../../components/MainCard';

// ================================|| 404 ||================================ //

const SessionsPage: React.FC = () => {

    return (
        <MainCard title="Session Page">
            <Typography>List/Table of sessions managed by the Culturous.</Typography>
            <Typography>Should include method to create a new session</Typography>
            <Typography>Rows links to individual session.</Typography>
        </MainCard>
    )
};

export default SessionsPage;
