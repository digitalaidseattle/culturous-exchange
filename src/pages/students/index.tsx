
// material-ui

// project import
import { Typography } from '@mui/material';
import MainCard from '../../components/MainCard';
import StudentsDetailsTable from './StudentsDetailsTable';

// ================================|| 404 ||================================ //

const StudentsPage: React.FC = () => {
    return (
        <MainCard title="Students Page">
            <Typography>List/Table of students enrolled in the program.</Typography>
            <Typography>Should include method to upload a spreadsheet</Typography>
            <Typography>Investigate integration with Google Docs to obtain data</Typography>
            <StudentsDetailsTable />
        </MainCard>
    )
};

export default StudentsPage;
