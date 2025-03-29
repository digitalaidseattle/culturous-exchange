import { Box, TextField, InputLabel, MenuItem, Select } from '@mui/material';
import { STUDENT_FIELD, GENDER_OPTION } from '../../constants';
import { useContext } from 'react';
import { StudentContext } from '.';

interface Props {
  handleFieldChange: (event: any) => void
}

const StudentInfo: React.FC<Props> = ( {handleFieldChange} ) => {
  const { student } = useContext(StudentContext);
  return (
    <Box>
      {STUDENT_FIELD.map(( {key, label, type, required}, idx ) => (
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
                {GENDER_OPTION.map((genderOption: string, idx: number) => (
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