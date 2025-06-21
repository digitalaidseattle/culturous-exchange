/**
 *  StudentCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { StarFilled, StarOutlined } from "@ant-design/icons";
import {
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import { format } from "date-fns";

import { useContext } from "react";
import { placementService } from "../api/cePlacementService";
import { planEvaluator } from "../api/planEvaluator";
import { planGenerator } from "../api/planGenerator";
import { Placement } from "../api/types";
import { PlanContext } from "../pages/plan";


export const StudentCard: React.FC<{ placement: Placement, showDetails: boolean }> = ({ placement, showDetails }) => {
    const { plan, setPlan } = useContext(PlanContext);

    const anchor = placement.anchor ? 'green' : 'gray';
    const timeWindows = placement.student!.timeWindows ? placement.student!.timeWindows ?? [] : [];

    const toggleAnchor = async (placement: Placement) => {
        placementService
            .updatePlacement(
                placement.plan_id,
                placement.student_id,
                { anchor: !placement.anchor })
            .then(() => refreshPlan())
            .catch((error) => console.error('Error toggling anchor:', error))
    };


    function refreshPlan() {
        planGenerator.hydratePlan(plan.id)
            .then((hydrated) => {
                if (hydrated) {
                    // Move seeding and evaluation logic to plan creation
                    //Check  not need if we always seed when creating plans
                    if (hydrated.groups === undefined || hydrated.groups.length === 0) {
                        planGenerator.seedPlan(hydrated)
                            .then((seededPlan) => {
                                planEvaluator.evaluate(seededPlan)
                                    .then((evaluatedPlan) => {
                                        setPlan(evaluatedPlan)
                                    })
                            })
                    } else {
                        planEvaluator.evaluate(hydrated)
                            .then((evaluatedPlan) => {
                                setPlan(evaluatedPlan)
                            })
                    }
                }
            })
    }


    return (placement &&
        <div id={`${placement.plan_id}.${placement.student_id}`} >
            <Card key={placement.student_id} sx={{ pointerEvents: 'auto', margin: 0 }}>
                <CardContent>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        {placement.anchor &&
                            <StarFilled style={{ fontSize: '150%', color: anchor }}
                                onClick={() => toggleAnchor(placement)} />
                        }
                        {!placement.anchor &&
                            <StarOutlined style={{ fontSize: '150%', color: anchor }}
                                onClick={() => toggleAnchor(placement)} />
                        }
                        <Typography fontWeight={600}>{placement.student!.name}</Typography>
                    </Stack>
                    <Typography>{placement.student!.country}</Typography>
                    {showDetails &&
                        <CardContent>
                            <Typography fontWeight={600}>Time Windows</Typography>
                            {timeWindows.map(tw => <Typography>{tw.day_in_week} {format(tw.start_date_time!, "haaa")} - {format(tw.end_date_time!, "haaa")}</Typography>)}
                        </CardContent>
                    }
                </CardContent>
            </Card>
        </div>
    );
}