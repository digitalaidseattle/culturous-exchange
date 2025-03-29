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
import { FailedStudent, Student, TimeWindow } from '../../api/types';
import AddStudentModal from './AddStudentModal';
import { studentService } from '../../api/ceStudentService';
import { createContext } from 'react';

interface StudentContextType {
    student: Student,
    setStudent: React.Dispatch<React.SetStateAction<Student>>
}

export const StudentContext = createContext<StudentContextType>({
    student: {} as Student,
    setStudent: () => {}
})

interface TimeWindowContextType {
    selection: Partial<TimeWindow>[],
    setSelection: React.Dispatch<React.SetStateAction<Partial<TimeWindow>[]>>
}

export const TimeWindowSelectionContext = createContext<TimeWindowContextType>({
    selection: [] as Partial<TimeWindow>[],
    setSelection: () => []
})

const UploadSection = () => {
    const { student, setStudent } = useContext(StudentContext)
    const { selection, setSelection } = useContext(TimeWindowSelectionContext)
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [failedStudents, setFailedStudents] = useState<FailedStudent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false)

    console.log('selection in index: ', selection)

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
        setSelection([]);
        setIsAddStudentModalOpen(false)
    }

    //FIX ME, TimeWindow removed from form. Should be sent in separate API call to associate with the student in a service, i.e. Promise.all
    const handleAddStudent = async (event: any) => {
        event.preventDefault();
        setRefresh(refresh + 1);

        try {
            const resp = await studentService.insert(student);
            setStudent({} as Student);
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
            />
        </Stack>
    )
}
const StudentsPage: React.FC = () => {
    const [student, setStudent] = useState<Student>({} as Student);
    const [selection, setSelection] = useState<Partial<TimeWindow>[]>([]);
    return (
        <StudentContext.Provider value={{student, setStudent}}>
            <TimeWindowSelectionContext.Provider value={{selection, setSelection}}>
                <MainCard title="Students Page">
                    <UploadSection />
                    <StudentsDetailsTable />
                </MainCard>
            </TimeWindowSelectionContext.Provider>
        </StudentContext.Provider>
    )
};

export default StudentsPage;
