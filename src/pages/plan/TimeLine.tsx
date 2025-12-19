
/**
 *  TimeLine.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Fragment, useContext, useEffect, useState } from "react";

import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DropAnimation,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    defaultDropAnimation,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { addHours, compareAsc, getHours, isFriday, isSaturday, isSunday } from "date-fns";

import { MoreOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { planService } from "../../api/cePlanService";
import { studentMover } from "../../api/studentMover";
import { Group, Identifier, Placement, Plan, Student, TimeWindow } from "../../api/types";
import StudentModal from "../../components/StudentModal";
import { PlanContext } from "./PlanContext";

type TimeRow = {
    id: Identifier;
    groupId: Identifier;
    studentId: Identifier;
    label: string;
    type: 'group' | 'anchor' | 'student' | 'waitlist';
    friday: boolean[];
    saturday: boolean[];
    sunday: boolean[];
}

const WAITLIST_ID = 'WAITLIST';
const STARTING_HOUR = 7;
const ENDING_HOUR = 22;
const OFFICE_HOURS = Array.from({ length: ENDING_HOUR - STARTING_HOUR + 1 }, (_, i) => STARTING_HOUR + i)

function calcAvailability(time_windows: TimeWindow[]): { friday: any; saturday: any; sunday: any; } {
    const range = ENDING_HOUR - STARTING_HOUR + 1
    const friday = Array(range).fill(false);
    const saturday = Array(range).fill(false);
    const sunday = Array(range).fill(false);
    time_windows.forEach(tw => {
        let timeCounter = tw.start_date_time;
        while (compareAsc(timeCounter, tw.end_date_time) !== 1) {
            const index = getHours(timeCounter) - STARTING_HOUR;
            if (index < range) {
                if (isFriday(timeCounter)) {
                    friday[index] = true;
                } else if (isSaturday(timeCounter)) {
                    saturday[index] = true;
                } else if (isSunday(timeCounter)) {
                    sunday[index] = true;
                }
            }
            timeCounter = addHours(timeCounter, 1);
        }
    });
    return {
        friday: friday,
        saturday: saturday,
        sunday: sunday
    }
}

interface SortableRowProps {
    id: string;
    row: TimeRow;
}
const SortableRow: React.FC<SortableRowProps> = ({ id, row }) => {

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        height: '20px',
        width: '200px',
        padding: 2,
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        borderTop: (row.type === 'group' || row.type === 'waitlist') ? '2px solid black' : '1px solid black',
        borderBottom: (row.type === 'group' || row.type === 'waitlist') ? '2px solid black' : '1px solid black',
    };

    function labelCell(row: TimeRow) {
        if (row.type === 'group' || row.type === 'waitlist') {
            return (
                <TableCell style={style}>
                    <Typography fontWeight={600}>{row.label}</Typography>
                </TableCell>
            )
        }
        else {
            const icon = row.type === 'anchor'
                ? <StarFilled style={{ fontSize: '150%', color: 'green' }} />
                : <StarOutlined style={{ fontSize: '150%', color: 'gray' }} />;
            return (
                <TableCell style={style}>
                    <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                        <IconButton {...attributes} {...listeners} size="small">
                            <MoreOutlined />
                        </IconButton>
                        {icon}
                        <Typography>{row.label}</Typography>
                    </Stack>
                </TableCell>
            )
        }
    }

    function dayCells(row: TimeRow) {
        const size = '20px';
        const color = row.type === 'group'
            ? '#90ee90'
            : '#90e9eeff';
        const style = {
            width: size,
            padding: 0,
            height: size
        }
        return (
            <Fragment key={row.id} >
                {row.friday.map((available, idx) =>
                    <td key={`${row.id}-f-${idx}`}
                        style={{ ...style, backgroundColor: available ? color : 'white' }}>
                        {available ? '✓' : ''}
                    </td>
                )}
                {row.saturday.map((available, idx) =>
                    <td key={`${row.id}-f-${idx}`}
                        style={{ ...style, backgroundColor: available ? color : 'white' }}>
                        {available ? '✓' : ''}
                    </td>
                )}
                {row.sunday.map((available, idx) =>
                    <td key={`${row.id}-f-${idx}`}
                        style={{ ...style, backgroundColor: available ? color : 'white' }}>
                        {available ? '✓' : ''}
                    </td>
                )}
            </Fragment>
        )
    }

    return (
        <TableRow ref={setNodeRef} style={style} hover>
            {labelCell(row)}
            {dayCells(row)}
        </TableRow>
    );
}

export const TimeLine: React.FC = () => {
    const { plan, setPlan } = useContext(PlanContext);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [rows, setRows] = useState<TimeRow[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedRow, setSelectedRow] = useState<TimeRow>();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Enable sort function when dragging 5px   💡 here!!!
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const dropAnimation: DropAnimation = {
        ...defaultDropAnimation,
    };

    useEffect(() => {
        // If plan is not defined, we don't want to initialize
        if (plan) {
            refresh();
        }
    }, [plan, initialized]);

    function refresh() {
        setInitialized(false);
        setRows(calculateRows(plan));
        setInitialized(true);
    }

    function createStudentRows(placements: Placement[]): TimeRow[] {
        const rows = placements.map(placement => {
            const { friday, saturday, sunday } = calcAvailability(placement.student?.timeWindows!)
            const row = {
                id: placement.student_id,
                groupId: placement.group_id,
                studentId: placement.student_id,
                label: placement.student ? placement.student.name : '',
                type: placement.anchor ? 'anchor' : 'student',
                friday: friday,
                saturday: saturday,
                sunday: sunday,
            } as TimeRow;
            return row;
        })
        return rows;
    }

    function createGroupRow(group: Group): TimeRow {
        const response = calcAvailability(group.time_windows!)
        return {
            id: group.id,
            groupId: group.id,
            label: group.name,
            type: 'group',
            friday: response.friday,
            saturday: response.saturday,
            sunday: response.sunday,
        } as TimeRow
    }

    function createWaitlistRow(): TimeRow {
        const response = calcAvailability([])
        return {
            id: WAITLIST_ID,
            groupId: WAITLIST_ID,
            label: "Waitlist",
            type: 'waitlist',
            friday: response.friday,
            saturday: response.saturday,
            sunday: response.sunday,
        } as TimeRow
    }

    function calculateRows(plan: Plan): TimeRow[] {
        const tempRows: TimeRow[] = [];
        plan.groups
            .sort((g0, g1) => g0.name.localeCompare(g1.name))
            .forEach(group => {
                tempRows.push(createGroupRow(group));
                createStudentRows(plan.placements.filter(p => p.group_id === group.id))
                    .forEach(sRow => { tempRows.push(sRow) });
            });
        tempRows.push(createWaitlistRow());
        createStudentRows(plan.placements.filter(p => !p.group_id))
            .forEach(sRow => { tempRows.push(sRow) });
        return tempRows;
    }

    const handleDragStart = ({ active }: DragStartEvent) => {
        setSelectedRow(rows.find(row => row.id === active.id))
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            const activeIndex = rows.findIndex((row) => row.id === active.id);
            const overIndex = rows.findIndex((row) => row.id === over!.id);
            const activeRow = rows[activeIndex];
            const overRow = rows[overIndex];
            if (activeRow !== undefined && overRow !== undefined) {
                setRows(arrayMove(rows, activeIndex, overIndex));
                studentMover.run(plan, activeRow.studentId, overRow.groupId)
                    .then(moved => {
                        planService.save(moved)
                            .then(saved => {
                                setPlan(saved);
                                refresh();
                            })
                    })
                    .finally(() => setSelectedRow(undefined))
            }
        }
    };

    return (
        <>
            {!plan &&
                <Typography>No plan found.</Typography>
            }
            {initialized &&
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <Table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <TableHead>
                            <tr>
                                <th style={{ minWidth: '250px' }} rowSpan={2}>
                                </th>
                                <th colSpan={OFFICE_HOURS.length} style={{ textAlign: 'center' }}>
                                    Friday
                                </th>
                                <th colSpan={OFFICE_HOURS.length} style={{ textAlign: 'center' }}>
                                    Saturday
                                </th>
                                <th colSpan={OFFICE_HOURS.length} style={{ textAlign: 'center' }}>
                                    Sunday
                                </th>
                            </tr>
                            <tr>
                                {OFFICE_HOURS.map((hour, idx) =>
                                    <th key={`fri-${idx}`} style={{ width: "30px", textAlign: 'center' }}>
                                        {hour}
                                    </th>
                                )}
                                {OFFICE_HOURS.map((hour, idx) =>
                                    <th key={`sat-${idx}`} style={{ width: "30px", textAlign: 'center' }}>
                                        {hour}
                                    </th>
                                )}
                                {OFFICE_HOURS.map((hour, idx) =>
                                    <th key={`sun-${idx}`} style={{ width: "30px", textAlign: 'center' }}>
                                        {hour}
                                    </th>
                                )}
                            </tr>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, idx) =>
                                <SortableRow key={idx} id={`${row.id}`} row={row} />
                            )}
                        </TableBody>
                        <DragOverlay dropAnimation={dropAnimation}>
                            {selectedRow ?
                                <SortableRow id={`${selectedRow.id}`} row={selectedRow} />
                                : null}
                        </DragOverlay>
                    </Table>
                </DndContext >
            }
            {
                selectedStudent &&
                <StudentModal
                    mode={'edit'}
                    student={selectedStudent!}
                    open={selectedStudent !== null}
                    onClose={() => setSelectedStudent(null)}
                    onChange={() => setSelectedStudent(null)} />
            }
        </>
    )
};
