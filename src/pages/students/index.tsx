/**
 *  students/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useState } from 'react';

/**
 *  students/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

// material-ui
import { Button, Stack } from '@mui/material';

// project import
import { MainCard } from '@digitalaidseattle/mui';

import StudentsDetailsTable from './StudentsDetailsTable';
import StudentUploader from './StudentUploader';
import { RefreshContext } from '@digitalaidseattle/core';

const UploadSection = () => {
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);

    const handleUpdate = (resp: any) => {
        console.log('handleUpdate', resp);
        setRefresh(refresh + 1);
        setShowDropzone(false);
    }
    return (
        <Stack>
            <Stack spacing={2} m={2} direction={'row'}>
                <Button
                    title='Upload Student'
                    variant="contained"
                    color="primary"
                    onClick={() => setShowDropzone(!showDropzone)}>
                    Upload
                </Button>
            </Stack>
            {showDropzone &&
                <StudentUploader onChange={handleUpdate} />
            }
        </Stack>
    )
}
const StudentsPage: React.FC = () => {
    return (
        <MainCard title="Students Page">
            <UploadSection />
            <StudentsDetailsTable />
        </MainCard>
    )
};

export default StudentsPage;
