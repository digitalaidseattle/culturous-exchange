import { FormControl, ListItemText, MenuItem, Select } from '@mui/material';
import { TIME_SLOTS } from '../constants';
import { useContext } from 'react';
import { studentUploader } from '../api/studentUploader';
import { TimeWindowSelectionContext } from '../pages/students';

const SelectTimeWindow: React.FC = () => {
  const { selection, setSelection } = useContext(TimeWindowSelectionContext)

  const handleChange = (e: any) => {
    const mostRecentlySelected = e.target.value[e.target.value.length-1];
    const newTimeWindow = studentUploader.createTimeWindows(mostRecentlySelected);
    setSelection((prev) => [...prev, ...newTimeWindow])
  }

  return (
    <FormControl>
      <Select
        multiple
        value={selection}
        onChange={handleChange}
      >
        {TIME_SLOTS.map((timeSlot, idx) => (
          <MenuItem key={idx} value={timeSlot}>
            <ListItemText primary={timeSlot}></ListItemText>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SelectTimeWindow;