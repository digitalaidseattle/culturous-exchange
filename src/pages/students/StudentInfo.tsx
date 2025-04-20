import { Box, TextField, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
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
          {(key === 'name' || key === 'email' || key === 'age' || key === 'country' || key === 'city') && (
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
            <FormLabel required>{label}</FormLabel>
            <RadioGroup
              aria-label="gender"
              name={key}
              value={student.gender || ''}
              onChange={handleFieldChange}
              row
            >
              {GENDER_OPTION.map((genderOption: string, idx: number) => (
                <FormControlLabel
                  key={idx}
                  value={genderOption}
                  control={<Radio />}
                  label={genderOption}
                />
              ))}
            </RadioGroup>
          </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
};

export default StudentInfo;