import { Box, TextField, InputLabel, MenuItem, Select } from '@mui/material';
import { StudentField } from '../../api/types';
import { useContext } from 'react';
import { StudentContext } from '.';

const studentField: StudentField[] = [
  { key: 'name', label: 'Full Name', type: 'string', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'age', label: 'Age', type: 'number', required: true },
  { key: 'gender', label: 'Gender', type: 'string', required: true },
  { key: 'country', label: 'Country', type: 'string', required: true },
];

const genderOptions = ['female', 'male', 'other']

interface Props {
  handleFieldChange: (event: any) => void
}

const StudentInfo: React.FC<Props> = ( {handleFieldChange} ) => {
  const { student } = useContext(StudentContext);
  return (
    <Box>
      {studentField.map(( {key, label, type, required}, idx ) => (
        <Box key={idx}>
          {(key === 'name' || key === 'email' || key === 'age' || key === 'country') && (
            <TextField
              autoFocus
              required={required}
              key={key}
              margin="dense"
              id={key}
              name={key}
              label={label}
              type={type}
              fullWidth={key !== 'age'}
              variant="standard"
              onChange={handleFieldChange}
            />
          )}
          {(key === 'gender' && (
            <Box my={2}>
              <InputLabel>{label}</InputLabel>
              <Select
                name={key}
                label={label}
                value={student.gender || ''}
                required
                onChange={handleFieldChange}
              >
                {genderOptions.map((genderOption: string, idx: number) => (
                  <MenuItem key={idx} value={genderOption}>{genderOption}</MenuItem>
                ))}
              </Select>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
};

export default StudentInfo;