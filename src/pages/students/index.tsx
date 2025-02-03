
/**
 *  students/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

// material-ui

// project import
import { MainCard } from '@digitalaidseattle/mui';
import StudentsDetailsTable from './StudentsDetailsTable';

// ================================|| 404 ||================================ //

const StudentsPage: React.FC = () => {
    return (
        <MainCard title="Students Page">
            <StudentsDetailsTable />
        </MainCard>
    )
};

export default StudentsPage;
