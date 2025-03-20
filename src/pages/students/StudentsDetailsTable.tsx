/**
 *  StudentsDetailsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

// import Box from '@mui/material/Box';
import {
  DataGrid,
  getGridNumericOperators,
  getGridStringOperators,
  GridColDef,
  GridFilterModel,
  GridSortModel
} from '@mui/x-data-grid';

import { LoadingContext, RefreshContext } from '@digitalaidseattle/core';
import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { studentService } from '../../api/ceStudentService';
import { Student, TimeWindow } from '../../api/types';
import DisplayTimeWindow from '../../components/DisplayTimeWindow';

const PAGE_SIZE = 10;

const timeWindows: TimeWindow[] = [
  {
    id: 1,
    student_id: '32df5f0b-aacb-42cc-87a7-0d6d72c75b40',
    group_id: null,
    day_in_week: "Friday",
    start_t: "09:00",
    end_t: "15:00"
  },
  {
    id: 2,
    student_id: '32df5f0b-aacb-42cc-87a7-0d6d72c75b40',
    group_id: null,
    day_in_week: "Saturday",
    start_t: "17:00",
    end_t: "20:00"
  },
  {
    id: 3,
    student_id: '32df5f0b-aacb-42cc-87a7-0d6d72c75b40',
    group_id: null,
    day_in_week: "Sunday",
    start_t: "07:00",
    end_t: "12:00"
  },
  {
    id: 4,
    student_id: '084dd366-492f-4497-8a21-320d88b8b6c7',
    group_id: null,
    day_in_week: "Sunday",
    start_t: "12:00",
    end_t: "17:00"
  }
];

const getColumns = (): GridColDef[] => {
  return [
    {
      field: 'id',
      headerName: 'Id',
      width: 150,
      filterable: false
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 150,
      type: 'number',
      filterOperators: getGridNumericOperators()
        .filter((operator) => studentService.supportedNumberFilters().includes(operator.value))
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => studentService.supportedStringFilters().includes(operator.value))

    },
    {
      field: 'country',
      headerName: 'Country',
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'availabilities',
      headerName: 'Availabilities',
      width: 150,
      renderCell: (params) => {
        const timeWindows = Array.isArray(params.value) ? params.value : [];
        return <DisplayTimeWindow timeWindows={timeWindows} />
      },
      filterable: false
    }
  ];
};

const StudentsDetailsTable: React.FC = () => {
  const { setLoading } = useContext(LoadingContext);
  const { refresh } = useContext(RefreshContext);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });

  useEffect(() => {
    if (paginationModel && sortModel && filterModel) {
      // Only one filter field is supported at a time in Free MUI distribution
      setLoading(true);
      const queryModel = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortField: sortModel.length === 0 ? 'name' : sortModel[0].field,
        sortDirection: sortModel.length === 0 ? 'asc' : sortModel[0].sort,
        filterField: filterModel.items.length > 0 ? filterModel.items[0].field : undefined,
        filterOperator: filterModel.items.length > 0 ? filterModel.items[0].operator : undefined,
        filterValue: filterModel.items.length > 0 ? filterModel.items[0].value : undefined,
      } as QueryModel;
      studentService
        .find(queryModel)
        .then((pi) => {
          const updatedRows = pi.rows.map(student => ({
            ...student,
            availabilities: timeWindows.filter(tw => tw.student_id === student.id)
          }));
          setPageInfo({ rows: updatedRows, totalRowCount: pi.totalRowCount })
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [refresh, paginationModel, sortModel, filterModel]);

  return (
    <DataGrid
      rows={pageInfo.rows}
      columns={getColumns()}
      rowCount={pageInfo.totalRowCount}
      pageSizeOptions={[5, 10, 25, 100]}

      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}

      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={setSortModel}

      filterMode="server"
      filterModel={filterModel}
      onFilterModelChange={setFilterModel}
    />
  );
};

export default StudentsDetailsTable;
