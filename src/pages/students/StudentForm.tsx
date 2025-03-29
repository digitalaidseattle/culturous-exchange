import { Box, DialogContentText } from '@mui/material';
import { Student } from '../../api/types';
import { useContext } from 'react';
import { StudentContext, TimeWindowSelectionContext } from '.';
import StudentInfo from './StudentInfo';
import SelectTimeWindow from '../../components/SelectTimeWindow';
import DisplayTimeWindow from '../../components/DisplayTimeWindow';


const StudentForm: React.FC = () => {
  const { setStudent } = useContext(StudentContext);
  const { selection } = useContext(TimeWindowSelectionContext);

  const handleFieldChange = (event: any) => {
    const { name, value } = event.target;
    setStudent((prevStudent: Student) => ({
      ...prevStudent,
      [name]: value
    }))
  }

  return (
    <Box>
      <StudentInfo
        handleFieldChange={handleFieldChange}
      />
      <Box my={4}>
        <DialogContentText>
          Select Availabilities
        </DialogContentText>
        <SelectTimeWindow />
        <DisplayTimeWindow timeWindows={selection} />
      </Box>
    </Box>
  )
}

export default StudentForm;