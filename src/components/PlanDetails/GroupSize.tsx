/**
 *  GroupCount.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Slider,
  Stack,
  Typography
} from "@mui/material";
import { PlanProps } from "../../utils/props";
import { placementService } from "../../api/cePlacementService";

export const GroupSize: React.FC<PlanProps> = ({ plan }) => {
  const [values, setValues] = useState<number>(10);
  const [numAnchor, setNumAnchor] = useState<number>(0);
  const [numStudents, setNumStudents] = useState<number>(0);

  const [min, setMin] = useState<number>(5);
  const [max, setMax] = useState<number>(10);

  useEffect(() => {
    // TODO base values, min, & max on student counts
    setMin(5);
    setMax(10);
    if (plan) {
      (async () => {
        const placement = await placementService.findByPlan(plan.id);
        setNumStudents(placement.length);
        const anchors = placement.filter((placement) => placement.anchor);
        setNumAnchor(anchors.length);

            if (numStudents && numAnchor) {
              const recommendGroupSize = Math.floor(numStudents / numAnchor);
              setValues(Math.min(Math.max(recommendGroupSize, min), max));

              console.log('numStudents', numStudents);
              console.log('numAnchor', numAnchor);
              console.log('value', values);
            }
          })();
        }
    }, [plan])

  function handleChange(_event: Event, newValue: number | number[]): void {
    setValues(newValue as number);
  }

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction={'row'} padding={5} spacing={5}>
            <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
              Group Size
            </Typography>
            <Box sx={{ width: 400 }}>
              <Slider
                aria-label="Always visible"
                value={values}
                step={1}
                min={min}
                max={max}
                valueLabelDisplay="on"
                onChange={handleChange}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </>
  )
};
