/**
 *  students/index.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useState } from 'react';
// material-ui
import { Button, Stack } from '@mui/material';

// project import
import { MainCard } from '@digitalaidseattle/mui';

import { RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { createContext } from 'react';
import { studentService } from '../../api/ceStudentService';
import { timeWindowService } from '../../api/ceTimeWindowService';
import { FailedStudent, Student } from '../../api/types';
import { UI_STRINGS } from '../../constants';
import { ShowLocalTimeContext } from '../../components/ShowLocalTimeContext';
import StudentModal from '../../components/StudentModal';
import { TimeToggle } from '../../components/TimeToggle';
import FailedStudentsModal from './FailedStudentsModal';
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


const ToolsSection = () => {
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
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={2} m={2} direction={'row'}>
                    <Button
                        title={UI_STRINGS.UPLOAD_STUDENT}
                        variant="contained"
                        color="primary"
                        onClick={() => setShowDropzone(!showDropzone)}>
                        {UI_STRINGS.UPLOAD}
                    </Button>
                    <Button
                        title={UI_STRINGS.ADD_STUDENT}
                        variant="contained"
                        color="primary"
                        onClick={() => setIsAddStudentModalOpen(true)}>
                        {UI_STRINGS.ADD_STUDENT}
                    </Button>
                </Stack>
                <TimeToggle />
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
    const [showLocalTime, setShowLocalTime] = useState<boolean>(false);

    return (
        <StudentContext.Provider value={{ student, setStudent }}>
            <TimeWindowSelectionContext.Provider value={{ selection, setSelection }}>
                <ShowLocalTimeContext.Provider value={{ showLocalTime, setShowLocalTime }}>
                    <MainCard title={UI_STRINGS.STUDENTS_PAGE_TITLE}>
                        <ToolsSection />
                        <StudentsDetailsTable />
                    </MainCard>
                </ShowLocalTimeContext.Provider>
            </TimeWindowSelectionContext.Provider>
        </StudentContext.Provider>
    )
};

export default StudentsPage;
