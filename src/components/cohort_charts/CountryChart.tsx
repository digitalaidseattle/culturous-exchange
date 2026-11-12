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

export const CountryChart: React.FC<{ cohort: Cohort }> = ({ cohort }) => {

    const countryData = useMemo(() => {
        const counts = new Map<string, number>();
        (cohort?.enrollments ?? []).forEach(enrollment => {
            const country = enrollment.student?.country?.trim() || 'Unknown';
            counts.set(country, (counts.get(country) ?? 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([country, count], id) => ({ id, label: country, value: count }));
    }, [cohort]);

    return (countryData.length > 0 &&
        <PieChart
            series={[{ data: countryData, innerRadius: 30, paddingAngle: 1, cornerRadius: 3 }]}
            height={240}
            slotProps={{
                legend: {
                    direction: 'vertical',
                    sx: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, auto)',
                        columnGap: 2,
                        rowGap: 1
                    }
                }
            }}
        />
    )
};
