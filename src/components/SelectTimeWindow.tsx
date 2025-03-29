import { FormControl, ListItemText, MenuItem, Select } from '@mui/material';
import { TIME_SLOTS } from '../constants';
import { useContext, useState } from 'react';
import { studentUploader } from '../api/studentUploader';
import { TimeWindowSelectionContext } from '../pages/students';

const SelectTimeWindow: React.FC = () => {
  const { setSelection } = useContext(TimeWindowSelectionContext)
  const [localSelection, setLocalSelection] = useState<string[]>([]);

  const handleChange = (e: any) => {
    const newTimeWindow = e.target.value
      .map((entry: string) => studentUploader.createTimeWindows(entry))
      .flat();
    setSelection((prev) => [...prev, ...newTimeWindow])
    setLocalSelection([]);
  }
  return (
    <FormControl>
      <Select
        multiple
        value={localSelection}
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