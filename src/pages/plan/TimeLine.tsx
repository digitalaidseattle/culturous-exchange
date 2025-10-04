
/**
 *  SprintPanel.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Fragment, useContext, useEffect, useState } from "react";

import {
    Stack,
    Typography
} from "@mui/material";
import { getHours, isFriday, isSaturday, isSunday } from "date-fns";

import { StarFilled, StarOutlined } from "@ant-design/icons";
import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { Group, Placement, Plan, Student, TimeWindow } from "../../api/types";
import StudentModal from "../../components/StudentModal";
import { PlanContext } from "./PlanContext";
import { toZonedTime } from "date-fns-tz";

type TimeRow = {
    id: string;
    label: string;
    type: 'group' | 'anchor' | 'student' | 'waitlist';
    friday: boolean[];
    saturday: boolean[];
    sunday: boolean[];
    children: TimeRow[];
}

const WAITLIST_ID = 'WAITLIST';
const startingHour = 7;
const endingHour = 22;


function calcAvailability(time_windows: TimeWindow[]): { friday: any; saturday: any; sunday: any; } {

    const friday = Array(endingHour - startingHour + 1).fill(false);
    const saturday = Array(endingHour - startingHour + 1).fill(false);
    const sunday = Array(endingHour - startingHour + 1).fill(false);
    time_windows.forEach(tw => {
        const localStart = toZonedTime(tw.start_date_time!, "America/Los_Angeles");
        const localEnd = toZonedTime(tw.end_date_time, "America/Los_Angeles");

        for (let i = getHours(localStart); i <= getHours(localEnd); i++) {
            if (isFriday(localStart) && i >= startingHour && i < endingHour + 1) {
                friday[i - startingHour] = true;
            } else if (isSaturday(localStart) && i >= startingHour && i < endingHour + 1) {
                saturday[i - startingHour] = true;
            } else if (isSunday(localEnd) && i >= startingHour && i < endingHour + 1) {
                sunday[i - startingHour] = true;
            }
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
        return placements.map(placement => {
            const { friday, saturday, sunday } = calcAvailability(placement.student?.timeWindows!)
            return {
                id: `${placement.plan_id}:${placement.student_id}`,
                label: placement.student ? placement.student.name : '',
                type: placement.anchor ? 'anchor' : 'student',
                friday: friday,
                saturday: saturday,
                sunday: sunday,
                children: []
            } as TimeRow
        })
    }

    function createGroupRow(group: Group, children: TimeRow[]): TimeRow {
        console.log('Creating group row for group:', group);
        const response = calcAvailability(group.time_windows!)
        console.log('Creating group row for group: response', response);
        return {
            id: group.id!,
            label: group.name,
            type: 'group',
            friday: response.friday,
            saturday: response.saturday,
            sunday: response.sunday,
            children: children
        } as TimeRow
    }

    function createWaitlistRow(children: TimeRow[]): TimeRow {
        return {
            id: WAITLIST_ID,
            label: "Waitlist",
            type: 'waitlist',
            friday: Array(endingHour - startingHour + 1).fill(false),
            saturday: Array(endingHour - startingHour + 1).fill(false),
            sunday: Array(endingHour - startingHour + 1).fill(false),
            children: children
        } as TimeRow
    }

    function calculateRows(plan: Plan): TimeRow[] {
        const tempRows = plan.groups
            .sort((g0, g1) => g0.name.localeCompare(g1.name))
            .map(group => createGroupRow(group, createStudentRows(plan.placements.filter(p => p.group_id === group.id))));
        const waitlist = createWaitlistRow(createStudentRows(plan.placements.filter(p => !p.group_id)));
        return [...tempRows, waitlist];
    }

    function handleClildRowClick(row: TimeRow) {
        const placement = plan.placements.find(p => p.student_id === row.id.split(':')[1]);
        setSelectedStudent(placement ? placement.student! : null);
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
                                <tr key={r.id} style={{ borderTop: '2px solid black', borderBottom: '2px solid black' }}>
                                    <td>
                                        <Typography fontWeight={600}>{r.label}</Typography>
                                    </td>
                                    <Fragment key={r.id} >
                                        {r.friday.map((available, idx) =>
                                            <td key={`${r.id}-f-${idx}`} style={{ backgroundColor: available ? '#90ee90' : 'white' }}>
                                                {available ? '✓' : ''}
                                            </td>
                                        )}
                                        {r.saturday.map((available, idx) =>
                                            <td key={`${r.id}-f-${idx}`} style={{ backgroundColor: available ? '#90ee90' : 'white' }}>
                                                {available ? '✓' : ''}
                                            </td>
                                        )}
                                        {r.sunday.map((available, idx) =>
                                            <td key={`${r.id}-f-${idx}`} style={{ backgroundColor: available ? '#90ee90' : 'white' }}>
                                                {available ? '✓' : ''}
                                            </td>
                                        )}
                                    </Fragment>
                                </tr>
                                {r.children.map(child =>
                                    <Fragment key={child.id} >
                                        <tr onClick={() => handleClildRowClick(child)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <Stack direction={'row'} spacing={{ xs: 1, sm: 1 }}>
                                                    {child.type === 'anchor' &&
                                                        <StarFilled style={{ fontSize: '150%', color: 'green' }} />
                                                    }
                                                    {child.type === 'student' &&
                                                        <StarOutlined style={{ fontSize: '150%', color: 'gray' }} />
                                                    }
                                                    <Typography>{child.label}</Typography>
                                                </Stack>
                                            </td>
                                            {child.friday.map((cAvailable, idx) =>
                                                <td key={`${child.id}-f-${idx}`} style={{ backgroundColor: cAvailable ? '#90e9eeff' : 'white' }}>
                                                    {cAvailable ? '✓' : ''}
                                                </td>
                                            )}
                                            {child.saturday.map((cAvailable, idx) =>
                                                <td key={`${child.id}-f-${idx}`} style={{ backgroundColor: cAvailable ? '#90e9eeff' : 'white' }}>
                                                    {cAvailable ? '✓' : ''}
                                                </td>
                                            )}
                                            {child.sunday.map((cAvailable, idx) =>
                                                <td key={`${child.id}-f-${idx}`} style={{ backgroundColor: cAvailable ? '#90e9eeff' : 'white' }}>
                                                    {cAvailable ? '✓' : ''}
                                                </td>
                                            )}
                                        </tr>
                                    </Fragment>)}
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
