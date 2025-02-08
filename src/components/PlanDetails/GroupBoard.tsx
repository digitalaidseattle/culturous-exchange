
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useEffect, useState } from "react";

import { ExclamationCircleFilled, StarFilled } from "@ant-design/icons";
import { DDCategory, DDType, DragAndDrop } from '@digitalaidseattle/draganddrop';
import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography
} from "@mui/material";
import { PlanProps } from "../../utils/props";

export const StudentCard = (props: { enrollment: Enrollment }) => {
    const anchor = props.enrollment.anchor ? 'green' : 'gray;'
    const priority = props.enrollment.priority ? 'green' : 'gray;'
    return (
        <Card sx={{ pointerEvents: 'auto', margin: 0 }}>
            <CardContent>
                <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        {props.enrollment.anchor &&
                            <StarFilled style={{ fontSize: '150%', color: anchor }} />
                        }
                        {props.enrollment.priority &&
                            <ExclamationCircleFilled style={{ fontSize: '150%', color: priority }} />
                        }
                    </Stack>
                    <Typography>{props.enrollment.student.name}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

type EnrollmentWrapper = Enrollment & DDType

export const GroupBoard: React.FC<PlanProps> = ({ plan }) => {
    const [categories, setCategories] = useState<DDCategory<string>[]>();

    useEffect(() => {
        setCategories(plan.groups.map(group => {
            return { label: group.groupNo, value: group.groupNo }
        }))
    }, [plan])

    function handleChange(c: Map<string, unknown>, t: Enrollment) {
        console.log(c, t)
    }

    function isCategory(item: EnrollmentWrapper, category: DDCategory<any>): boolean {
        if (plan) {
            const group = plan.groups.find(group => group.groupNo === category.value);
            return group ? group.studentIds.includes(item.studentId) : false;
        }
        return false;
    }

    function cellRender(item: EnrollmentWrapper): ReactNode {
        return <StudentCard enrollment={item} />
    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <>{plan && categories &&
                    <DragAndDrop
                        onChange={(c: Map<string, unknown>, e: Enrollment) => handleChange(c, e)}
                        items={plan.enrollments}
                        categories={categories}
                        isCategory={isCategory}
                        cardRenderer={cellRender}
                    />}
                    {!plan &&
                        <Typography>No plan found.</Typography>
                    }
                </>
            </Box>
        </>
    )
};
