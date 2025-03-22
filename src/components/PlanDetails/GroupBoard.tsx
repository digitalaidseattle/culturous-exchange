
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
import { Placement } from "../../api/types";
import { PlanProps } from "../../utils/props";


export const StudentCard = (props: { placement: Placement }) => {
    const anchor = props.placement.anchor ? 'green' : 'gray;'
    const priority = props.placement.priority ? 'green' : 'gray;'
    return (
        <Card sx={{ pointerEvents: 'auto', margin: 0 }}>
            <CardContent>
                <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        {props.placement.anchor &&
                            <StarFilled style={{ fontSize: '150%', color: anchor }} />
                        }
                        {props.placement.priority &&
                            <ExclamationCircleFilled style={{ fontSize: '150%', color: priority }} />
                        }
                    </Stack>
                    <Typography>{props.placement.student!.name}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

type PlacementWrapper = Placement & DDType

export const GroupBoard: React.FC<PlanProps> = ({ plan }) => {
    const [categories, setCategories] = useState<DDCategory<string>[]>();

    useEffect(() => {
        setCategories(plan.groups.map(group => {
            return { label: group.groupNo!, value: group.groupNo! }
        }))
    }, [plan])

    function handleChange(c: Map<string, unknown>, t: Placement) {
        console.log(c, t)
    }

    function isCategory(item: PlacementWrapper, category: DDCategory<any>): boolean {
        if (plan) {
            const group = plan.groups.find(group => group.groupNo === category.value);
            return group ? group.students.find(student => student.id === item.student_id) ? true : false : false;
        }
        return false;
    }

    function cellRender(item: PlacementWrapper): ReactNode {
        return <StudentCard placement={item} />
    }

    function seedGroups(): void {
        alert('Not implemented yet')
    }

    return (
        <>
            <Box sx={{ marginTop: 1 }}  >
                <Button
                    color="primary"
                    variant="contained"
                    onClick={seedGroups}
                >
                    Seed
                </Button>
                <>{plan && categories &&
                    <DragAndDrop
                        onChange={(c: Map<string, unknown>, e: Placement) => handleChange(c, e)}
                        items={plan.placements}
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
