
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useEffect, useState } from "react";

import { StarFilled } from "@ant-design/icons";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography
} from "@mui/material";
import { DragAndDrop, DDCategory, DDType } from '@digitalaidseattle/draganddrop';
import { Placement, Plan } from "../../api/types";


export const StudentCard = (props: { placement: Placement }) => {

    return (
        <Card sx={{ pointerEvents: 'auto', margin: 0 }}>
            <CardContent>
                <Typography>{props.placement.anchor && <StarFilled style={{ color: "red" }} />} {props.placement.student.name}</Typography>
            </CardContent>
        </Card>
    );
}

type EnrollmentWrapper = Placement & DDType

export const GroupBoard = (props: { plan: Plan | undefined }) => {
    const [categories, setCategories] = useState<DDCategory<string>[]>();

    useEffect(() => {
        if (props.plan) {
            setCategories(props.plan.groups.map(group => {
                return { label: group.groupNo, value: group.groupNo }
            }))
        }
    }, [props])

    function handleChange(c: Map<string, unknown>, t: Placement) {
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
        return <StudentCard placement={item} />
    }

    return (
        <>
            <Button variant='contained' onClick={() => alert('Placing Students')}>Place Students</Button>
            <Box sx={{ marginTop: 1 }}  >
                <>{props.plan && categories &&
                    <DragAndDrop
                        onChange={(c: Map<string, unknown>, e: Placement) => handleChange(c, e)}
                        items={props.plan.placements}
                        categories={categories}
                        isCategory={isCategory}
                        cardRenderer={cellRender}
                    />}
                    {!props.plan &&
                        <Typography>No plan found.</Typography>
                    }
                </>
            </Box>
        </>
    )
};
