/**
 * home/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { useMemo } from 'react';

// material-ui

// project import
import { PieChart } from '@mui/x-charts/PieChart';

import { Cohort } from '../../api/types';

export const GenderChart: React.FC<{ cohort: Cohort }> = ({ cohort }) => {



    const genderData = useMemo(() => {
        const counts = new Map<string, number>();
        (cohort?.enrollments ?? []).forEach(enrollment => {
            const gender = enrollment.student?.gender?.trim() || 'Unknown';
            counts.set(gender, (counts.get(gender) ?? 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([gender, count], id) => ({ id, label: gender, value: count }));
    }, [cohort]);

    return (genderData.length > 0 &&
        <PieChart
            series={[{ data: genderData, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
            height={240}
        />
    )
};
