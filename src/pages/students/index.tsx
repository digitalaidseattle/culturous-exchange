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

import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { createContext } from 'react';
import { studentService } from '../../api/ceStudentService';
import { timeWindowService } from '../../api/ceTimeWindowService';
import { FailedStudent, Student } from '../../api/types';
import FailedStudentsModal from './FailedStudentsModal';
import StudentModal from './StudentModal';
import StudentsDetailsTable from './StudentsDetailsTable';
import StudentUploader from './StudentUploader';

interface StudentContextType {
    student: Student,
    setStudent: React.Dispatch<React.SetStateAction<Student>>
}

export const StudentContext = createContext<StudentContextType>({
    student: {} as Student,
    setStudent: () => { }
})

interface TimeWindowContextType {
    selection: string[],
    setSelection: React.Dispatch<React.SetStateAction<string[]>>
}

export const TimeWindowSelectionContext = createContext<TimeWindowContextType>({
    selection: [] as string[],
    setSelection: () => []
})

const UploadSection = () => {
    const notifications = useNotifications();
    const { refresh, setRefresh } = useContext(RefreshContext);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [failedStudents, setFailedStudents] = useState<FailedStudent[]>([]);
    const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false)

    const handleUpdate = (resp: any) => {
        setRefresh(refresh + 1);
        setShowDropzone(false);
        if (resp.failedCount === resp.attemptedCount) {
            notifications.error(`Error uploading spreadsheet. Failed to add ${resp.successCount} of ${resp.attemptedCount}`)
            setFailedStudents(resp.failedStudents)
            setIsFailedModalOpen(true);
        } else if (resp.failedCount > 0) {
            setFailedStudents(resp.failedStudents)
            setIsFailedModalOpen(true);
            notifications.warn(
                `${resp.attemptedCount} Attempted, ${resp.successCount} added, ${resp.failedCount} failed.`
            );
        } else {
            notifications.success(`${resp.attemptedCount} Attempted, ${resp.successCount} successfully added`)
        }
    }

    const handleCloseAddStudentModal = () => {
        setIsAddStudentModalOpen(false)
    }

    const handleAddStudent = async (updated: Student) => {
        return timeWindowService
            .getTimeZone(updated.city!, updated.country)
            .then(resp => {
                updated.time_zone = resp.timezone
                updated.tz_offset = resp.offset
                timeWindowService.adjustTimeWindows(updated);

                studentService.save(updated)
                    .then(saved => {
                        console.log('saved', saved)

                        notifications.success(`Success. Added student: ${saved.name}`);
                        handleCloseAddStudentModal();
                    })
                notifications.success(`Success. Added student: ${updated.name}`);
                handleCloseAddStudentModal();
                setRefresh(refresh + 1)
            })
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
                isModalOpen={isFailedModalOpen}
                onClose={() => setIsFailedModalOpen(false)}
                failedStudents={failedStudents}
            />
            <StudentModal
                mode={'add'}
                student={studentService.emptyStudent()}
                open={isAddStudentModalOpen}
                onClose={() => handleCloseAddStudentModal()}
                onChange={handleAddStudent} />
        </Stack>
    )
}
const StudentsPage: React.FC = () => {
    const [student, setStudent] = useState<Student>({} as Student);
    const [selection, setSelection] = useState<string[]>([]);
    return (
        <StudentContext.Provider value={{ student, setStudent }}>
            <TimeWindowSelectionContext.Provider value={{ selection, setSelection }}>
                <MainCard title="Students Page">
                    <UploadSection />
                    <StudentsDetailsTable />
                </MainCard>
            </TimeWindowSelectionContext.Provider>
        </StudentContext.Provider>
    )
};

export default StudentsPage;
