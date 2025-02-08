
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

export const GroupCount: React.FC<PlanProps> = ({ plan }) => {
    const [values, setValues] = useState<number[]>([0, 10]);

    const [min, setMin] = useState<number>(5);
    const [max, setMax] = useState<number>(10);

    useEffect(() => {
        // TODO base values, min, & max on student counts
        setValues([5, 10])
        setMin(5);
        setMax(10);
    }, [plan])

    function handleChange(_event: Event, newValue: number | number[]): void {
        console.log(newValue)
        setValues(newValue as number[]);
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Stack direction={'row'} padding={5} spacing={5}>
                        <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
                            Number of Groups
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
