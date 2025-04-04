import { FormControl, ListItemText, MenuItem, Select } from '@mui/material';
import { TIME_SLOTS } from '../constants';
import { useContext, useEffect, useState } from 'react';
import { TimeWindowSelectionContext } from '../pages/students';

const SelectTimeWindow: React.FC = () => {
  const { selection, setSelection } = useContext(TimeWindowSelectionContext);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [selectValue, setSelectValue] = useState<string>("");

  useEffect(() => {
    if (selection.length > 0) {
      setSelectValue(selection[0]);
    } else {
      setSelectValue("");
    }
    setDisabled(selection.includes(TIME_SLOTS[TIME_SLOTS.length - 1]));
  }, [selection]);

  const handleChange = (e: any) => {
    const selectedTimeSlot = e.target.value;

    if (selectedTimeSlot === TIME_SLOTS[TIME_SLOTS.length - 1]) {
      setSelection([selectedTimeSlot]);
    } else if (!selection.includes(selectedTimeSlot)) {
      setSelection([...selection, selectedTimeSlot]);
    }
  };

  return (
    <FormControl>
      <Select
        value={selectValue}
        onChange={handleChange}
        disabled={disabled}
      >
        {TIME_SLOTS.map((timeSlot, idx) => (
          <MenuItem key={idx} value={timeSlot}>
            <ListItemText primary={timeSlot} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectTimeWindow;