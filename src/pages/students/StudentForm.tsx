import { Box, DialogContentText } from '@mui/material';
import { Student } from '../../api/types';
import { useContext } from 'react';
import { StudentContext } from '.';
import StudentInfo from './StudentInfo';
import SelectTimeWindow from '../../components/SelectTimeWindow';
import DisplaySelectedTimeWindows from './DisplaySelectedTimeWindows';


const StudentForm: React.FC = () => {
  const { setStudent } = useContext(StudentContext);

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
        <DialogContentText>{'Time Slot(s)'}</DialogContentText>
        <SelectTimeWindow />
        <DisplaySelectedTimeWindows />
      </Box>
    </Box>
  )
}

export default StudentForm;