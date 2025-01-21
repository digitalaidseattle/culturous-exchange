
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useEffect, useState } from "react";

import { StarFilled } from "@ant-design/icons";
import {
    Card,
    CardContent,
    Typography
} from "@mui/material";
import { DragAndDrop, DDCategory, DDType } from '@digitalaidseattle/draganddrop';


export const StudentCard = (props: { enrollment: Enrollment }) => {

    return (
        <Card sx={{ pointerEvents: 'auto', margin: 0 }}>
            <CardContent>
                <Typography>{props.enrollment.anchor && <StarFilled style={{color:"red"}}/>} {props.enrollment.student.name}</Typography>
            </CardContent>
        </Card>
    );
}

type EnrollmentWrapper = Enrollment & DDType

export const GroupBoard = (props: { plan: Plan | undefined }) => {
    const [categories, setCategories] = useState<DDCategory<string>[]>();

    useEffect(() => {
        if (props.plan) {
            setCategories(props.plan.groups.map(group => {
                return { label: group.groupNo, value: group.groupNo }
            }))
        }
    }, [props])

    function handleChange(c: Map<string, unknown>, t: Enrollment) {
        console.log(c, t)
    }

    function isCategory(item: EnrollmentWrapper, category: DDCategory<any>): boolean {
        if (props.plan) {
            const group = props.plan.groups.find(group => group.groupNo === category.value);
            return group ? group.studentIds.includes(item.studentId) : false;
        }
        return false;
    }

    function cellRender(item: EnrollmentWrapper): ReactNode {
        return <StudentCard enrollment={item} />
    }

    return (
        <>{props.plan && categories &&
            <DragAndDrop
                onChange={(c: Map<string, unknown>, e: Enrollment) => handleChange(c, e)}
                items={props.plan.enrollments}
                categories={categories}
                isCategory={isCategory}
                cardRenderer={cellRender}
            />}
            {!props.plan &&
                <Typography>No plan found.</Typography>
            }
        </>
    )
};
