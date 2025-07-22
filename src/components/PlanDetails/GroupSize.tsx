/**
 *  GroupCount.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { useContext, useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Slider,
  Stack,
  Typography
} from "@mui/material";
import { StepperContext } from "./index";
import { PlanContext } from "../../pages/plan/PlanContext";

export const GroupSize: React.FC = () => {
  const { plan } = useContext(PlanContext);
  const { groupSize, setGroupSize } = useContext(StepperContext);
  const [min, setMin] = useState<number>(2);
  const [max, setMax] = useState<number>(10);

  useEffect(() => {
    // TODO base min & max on student counts
    setMin(2);
    setMax(10);
    console.log('Group size changed:', groupSize);
  }, [plan, groupSize]);

  function handleChange(_event: Event, newValue: number | number[]): void {
    setGroupSize(newValue as number);
  }

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction={'row'} padding={5} spacing={5}>
            <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
              Group Size: {groupSize}
            </Typography>
            <Box sx={{ width: 400 }}>
              <Slider
                aria-label="Group size"
                value={groupSize}
                step={1}
                min={min}
                max={max}
                valueLabelDisplay="auto"
                onChange={handleChange}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </>
  )
};
