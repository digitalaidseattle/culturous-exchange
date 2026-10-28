/**
 *  PlanCharts.tsx
 *
 *  The three dot plots that summarize a plan's groups: group size, countries per
 *  group, and time overlap per group. They are three items for the grid of a
 *  PlanSummary, which decides where they sit.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { UI_STRINGS } from "../constants";
import { PlanStats } from "../services/plan/planStats";
import { OVERLAP_COLOR_STOPS } from "../utils/overlapColors";
import { DistributionChart } from "./DistributionChart";

const HOUR_UNIT = { one: UI_STRINGS.UNIT_HOUR, other: UI_STRINGS.HOURS };
const STUDENT_UNIT = { one: UI_STRINGS.UNIT_STUDENT, other: UI_STRINGS.UNIT_STUDENTS };
const COUNTRY_UNIT = { one: UI_STRINGS.UNIT_COUNTRY, other: UI_STRINGS.UNIT_COUNTRIES };

export const PlanCharts: React.FC<{ stats: PlanStats }> = ({ stats }) => (
    <>
        <DistributionChart
            title={UI_STRINGS.GROUP_SIZE_LABEL}
            groupCount={stats.groupCount}
            unit={STUDENT_UNIT}
            stats={stats.groupSize} />
        <DistributionChart
            title={UI_STRINGS.COUNTRIES_PER_GROUP}
            groupCount={stats.groupCount}
            unit={COUNTRY_UNIT}
            stats={stats.countriesPerGroup} />
        <DistributionChart
            title={UI_STRINGS.GROUP_OVERLAP}
            groupCount={stats.groupCount}
            unit={HOUR_UNIT}
            colorStops={OVERLAP_COLOR_STOPS}
            stats={stats.groupOverlap} />
    </>
);
