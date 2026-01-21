
// material-ui

// project import
import { Typography } from '@mui/material';
import { UI_STRINGS } from '../../constants';
import { MainCard } from '@digitalaidseattle/mui';

// ================================|| 404 ||================================ //

const StudentPage: React.FC = () => {

    return (
        <MainCard title={UI_STRINGS.STUDENT_PAGE_TITLE}>
            <Typography>{UI_STRINGS.NAME}</Typography>
            <Typography>{UI_STRINGS.EMAIL}</Typography>
            <Typography>{UI_STRINGS.AVAILABILITY}</Typography>
        </MainCard>
    )
};

export default StudentPage;
