/**
 *  overlapColors.ts
 *
 *  The color scale for group overlap, in hours: red at 0, orange at 1, yellow from
 *  2 to 3, and green from 4 on, blending smoothly between those. So under 2 hours
 *  reads red to orange, 2 to 3 hours reads yellow, and over 3 hours turns green.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { green, orange, red, yellow } from "@ant-design/colors";
import { ColorStop } from "./gradient";

export const OVERLAP_COLOR_STOPS: ColorStop[] = [
    { value: 0, color: red.primary! },
    { value: 1, color: orange.primary! },
    { value: 2, color: yellow.primary! },
    { value: 3, color: yellow.primary! },
    { value: 4, color: green.primary! }
];
