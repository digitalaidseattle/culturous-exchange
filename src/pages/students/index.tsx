
// material-ui
import { Typography } from '@mui/material';

// project import
import { MainCard } from '@digitalaidseattle/mui';
import StudentsDetailsTable from './StudentsDetailsTable';

// ================================|| 404 ||================================ //

const StudentsPage: React.FC = () => {
    return (
        <MainCard title="Students Page">
            <Typography>Should include method to upload a spreadsheet</Typography>
            <Typography>Investigate integration with Google Docs to obtain data</Typography>
            <StudentsDetailsTable />
        </MainCard>
    )
};

export default StudentsPage;
