/**
 *  CETextInput.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  FormControl,
  FormLabel,
  TextField
} from '@mui/material';

interface CETextInputProps {
  name: string;
  value: any;
  label: string;
  required: boolean;
  type: string;
  handleFieldChange: (event: any) => void;
  isError?: boolean;
  errorText?: string;
}

export const CETextInput: React.FC<CETextInputProps> = ({ 
  name, 
  value, 
  label, 
  required, 
  type, 
  handleFieldChange,
  isError,
  errorText
}) => {
  return (
    <FormControl key={name} fullWidth>
      <FormLabel required={required}>{label}</FormLabel>
      <TextField
        autoFocus
        required={required}
        margin="dense"
        id={name}
        name={name}
        type={type}
        variant="standard"
        value={value ?? ''}
        onChange={handleFieldChange}
        error={Boolean(isError)}
        helperText={isError ? (errorText || ' ') : ' '}
      />
    </FormControl>);
}