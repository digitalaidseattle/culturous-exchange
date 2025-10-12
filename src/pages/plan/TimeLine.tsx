
/**
 *  TimeLine.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Fragment, useContext, useEffect, useState } from "react";

import {
    Stack,
    Typography
} from "@mui/material";
import { addHours, compareAsc, getHours, isFriday, isSaturday, isSunday } from "date-fns";

import { StarFilled, StarOutlined } from "@ant-design/icons";
import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { Group, Placement, Plan, Student, TimeWindow } from "../../api/types";
import StudentModal from "../../components/StudentModal";
import { PlanContext } from "./PlanContext";

type TimeRow = {
    id: string;
    label: string;
    type: 'group' | 'anchor' | 'student' | 'waitlist';
    friday: boolean[];
    saturday: boolean[];
    sunday: boolean[];
}

const WAITLIST_ID = 'WAITLIST';
const startingHour = 7;
const endingHour = 22;

function calcAvailability(time_windows: TimeWindow[]): { friday: any; saturday: any; sunday: any; } {
    const range = endingHour - startingHour + 1
    const friday = Array(range).fill(false);
    const saturday = Array(range).fill(false);
    const sunday = Array(range).fill(false);
    time_windows.forEach(tw => {
        let timeCounter = tw.start_date_time;
        while (compareAsc(timeCounter, tw.end_date_time) !== 1) {
            const index = getHours(timeCounter) - startingHour;
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

export const TimeLine: React.FC = () => {
    const { plan } = useContext(PlanContext);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [rows, setRows] = useState<TimeRow[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const START_TIME = 7;
    const END_TIME = 22;
    const OFFICE_HOURS = Array.from({ length: END_TIME - START_TIME + 1 }, (_, i) => START_TIME + i)

    useEffect(() => {
        // If plan is not defined, we don't want to initialize
        if (plan) {
            setInitialized(false);
            setRows(calculateRows(plan));
            setInitialized(true);
        }
    }, [plan, initialized])

    function createStudentRows(placements: Placement[]): TimeRow[] {
        const rows = placements.map(placement => {
            const { friday, saturday, sunday } = calcAvailability(placement.student?.timeWindows!)
            const row = {
                id: `${placement.plan_id}:${placement.student_id}`,
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
            id: group.id!,
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

    function handleClildRowClick(row: TimeRow) {
        const placement = plan.placements.find(p => p.student_id === row.id.split(':')[1]);
        setSelectedStudent(placement ? placement.student! : null);
    }

    function rowLabel(row: TimeRow) {
        if (row.type === 'group' || row.type === 'waitlist') {
            return (
                <Typography fontWeight={600}>{row.label}</Typography>
            )
        }
        else {
            const icon = row.type === 'anchor'
                ? <StarFilled style={{ fontSize: '150%', color: 'green' }} />
                : <StarOutlined style={{ fontSize: '150%', color: 'gray' }} />;
            return (
                <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                    {icon}
                    <Typography>{row.label}</Typography>
                </Stack>
            )
        }
    }

    function dayCells(row: TimeRow) {
        const color = row.type === 'group'
            ? '#90ee90'
            : '#90e9eeff';
        return (
            <Fragment key={row.id} >
                {row.friday.map((available, idx) =>
                    <td key={`${row.id}-f-${idx}`}
                        style={{ backgroundColor: available ? color : 'white', width: 20 }}>
                        {available ? '✓' : ''}
                    </td>
                )}
                {row.saturday.map((available, idx) =>
                    <td key={`${row.id}-f-${idx}`}
                        style={{ backgroundColor: available ? color : 'white', width: 20 }}>
                        {available ? '✓' : ''}
                    </td>
                )}
                {row.sunday.map((available, idx) =>
                    <td key={`${row.id}-f-${idx}`}
                        style={{ backgroundColor: available ? color : 'white', width: 20 }}>
                        {available ? '✓' : ''}
                    </td>
                )}
            </Fragment>
        )
    }

    return (
        <>
            {!plan &&
                <Typography>No plan found.</Typography>
            }
            {initialized &&
                <table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: 200 }} rowSpan={2}>
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
                            {OFFICE_HOURS.map(hour =>
                                <th style={{ width: "30px", textAlign: 'center' }}>
                                    {hour}
                                </th>
                            )}
                            {OFFICE_HOURS.map(hour =>
                                <th style={{ width: "30px", textAlign: 'center' }}>
                                    {hour}
                                </th>
                            )}
                            {OFFICE_HOURS.map(hour =>
                                <th style={{ width: "30px", textAlign: 'center' }}>
                                    {hour}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r =>
                            <Fragment key={r.id} >
                                <tr key={r.id}
                                    style={{
                                        borderTop: (r.type === 'group' || r.type === 'waitlist') ? '2px solid black' : '',
                                        borderBottom: (r.type === 'group' || r.type === 'waitlist') ? '2px solid black' : '',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleClildRowClick(r)}>
                                    <td>
                                        {rowLabel(r)}
                                    </td>
                                    {dayCells(r)}
                                </tr>
                            </Fragment>
                        )}
                    </tbody>
                </table>}
            {selectedStudent &&
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
