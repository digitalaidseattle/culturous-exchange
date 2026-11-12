/**
 * home/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { useMemo } from 'react';

// material-ui

// project import
import { BarChart } from '@mui/x-charts/BarChart';

import { Cohort } from '../../api/types';
import { UI_STRINGS } from '../../constants';

export const StudentAgeChart: React.FC<{ cohort: Cohort }> = ({ cohort }) => {


    const ageData = useMemo(() => {
        const counts = new Map<number, number>();
        (cohort?.enrollments ?? []).forEach(enrollment => {
            const age = enrollment.student?.age;
            if (age != null) {
                counts.set(age, (counts.get(age) ?? 0) + 1);
            }
        });
        const ages = Array.from(counts.keys()).sort((a, b) => a - b);
        return { ages, counts: ages.map(age => counts.get(age)!) };
    }, [cohort]);


    return (ageData.ages.length > 0 &&
        <BarChart
            xAxis={[{ data: ageData.ages, scaleType: 'band', label: 'Age' }]}
            yAxis={[{ tickMinStep: 1 }]}
            series={[{ data: ageData.counts, label: UI_STRINGS.STUDENTS_LABEL }]}
            height={240}
            hideLegend
        />
    )
};
