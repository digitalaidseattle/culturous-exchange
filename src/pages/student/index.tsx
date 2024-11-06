
// material-ui

// project import
import { Typography } from '@mui/material';
import MainCard from '../../components/MainCard';

// ================================|| 404 ||================================ //

const StudentPage: React.FC = () => {

    return (
        <MainCard title="Student Page">
            <Typography>Name</Typography>
            <Typography>Email</Typography>
            <Typography>Availability</Typography>
        </MainCard>
    )
};

export default StudentPage;
