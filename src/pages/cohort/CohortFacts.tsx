/**
 *  CohortFacts.tsx
 *
 *  The facts about a cohort in one line, as on its page and on its card on the home page: how many
 *  students and plans it has, its active plan, and the day it was made.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Stack, Typography } from "@mui/material";
import { Cohort } from "../../api/types";
import { UI_STRINGS } from "../../constants";

export const CohortFacts: React.FC<{ cohort: Cohort }> = ({ cohort }) => (
    <Stack direction="row" flexWrap="wrap" columnGap={4} rowGap={0.5}>
        <Typography>{UI_STRINGS.STUDENTS_LABEL}: {cohort.enrollments?.length ?? 0}</Typography>
        <Typography>{UI_STRINGS.PLANS_LABEL}: {cohort.plans?.length ?? 0}</Typography>
        <Typography>
            {UI_STRINGS.ACTIVE_PLAN}: {cohort.plans?.find(plan => plan.active)?.name ?? UI_STRINGS.NO_ACTIVE_PLAN}
        </Typography>
        {cohort.created_at &&
            <Typography>
                {UI_STRINGS.CREATED}: {new Date(cohort.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </Typography>
        }
    </Stack>
);
