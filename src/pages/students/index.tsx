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
import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import FailedStudentsModal from './FailedStudentsModal';
import { FailedStudent, SelectAvailability, Student, StudentField } from '../../api/types';
import AddStudentModal from './AddStudentModal';
import { studentService } from '../../api/ceStudentService';

const UploadSection = () => {
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [failedStudents, setFailedStudents] = useState<FailedStudent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false)
    const [availabilities, setAvailabilities] = useState<SelectAvailability[]>([])

    const studentField: StudentField[] = [
        { key: 'name', label: 'Full Name', type: 'string', required: true },
        { key: 'age', label: 'Age', type: 'number', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'city', label: 'City', type: 'string', required: true },
        { key: 'state', label: 'State', type: 'string', required: true },
        { key: 'country', label: 'Country', type: 'string', required: true },
    ];


    const handleUpdate = (resp: any) => {
        setRefresh(refresh + 1);
        setShowDropzone(false);
        if (resp.failedCount === resp.attemptedCount) {
            notifications.error(`Error uploading spreadsheet. Failed to add ${resp.successCount} of ${resp.attemptedCount}`)
        } else if (resp.failedCount > 0) {
            setFailedStudents(resp.failedStudents)
            setIsModalOpen(true);
            notifications.warn(
                `${resp.attemptedCount} Attempted, ${resp.successCount} added, ${resp.failedCount} failed.`
            );
        } else {
            notifications.success(`${resp.attemptedCount} Attempted, ${resp.successCount} successfully added`)
        }
    }

    const handleCloseAddStudentModal = () => {
        setAvailabilities([]);
        setIsAddStudentModalOpen(false)
    }

    const handleAddStudent = async (event: any) => {
        event.preventDefault();
        setRefresh(refresh + 1);
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData).entries()) as Partial<Student>;
        formJson.availabilities = availabilities;

        try {
            const resp = await studentService.insert(formJson);
            notifications.success(`Success. Added student: - id ${resp.id} | - name: ${resp.name}`);
            handleCloseAddStudentModal();
        } catch (err: any) {
            console.error(`Insertion failed: ${err.message}`);
            notifications.error(`Insertion failed: ${err.message}`);
        }
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
                <Button
                    title='Add Student'
                    variant="contained"
                    color="primary"
                    onClick={() => setIsAddStudentModalOpen(true)}>
                    Add Student
                </Button>
            </Stack>
            {showDropzone &&
                <StudentUploader onChange={handleUpdate} />
            }
            <FailedStudentsModal
                isModalOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                failedStudents={failedStudents}
            />
            <AddStudentModal
                isAddStudentModalOpen={isAddStudentModalOpen}
                onClose={() => handleCloseAddStudentModal()}
                handleAddStudent={handleAddStudent}
                studentField={studentField}
                availabilities={availabilities}
                setAvailabilities={setAvailabilities}
            />
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
