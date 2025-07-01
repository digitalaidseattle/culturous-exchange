/**
 *  StudentsDetailsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
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
import { Student } from '../../api/types';

const PAGE_SIZE = 10;

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
      field: 'city',
      headerName: 'City',
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'state',
      headerName: 'State',
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
      field: 'availabilities',
      headerName: 'Availabilities',
      width: 150,
      renderCell: (params) => {
        const availabilities = Array.isArray(params.value)
          ? params.value
          : typeof params.value === 'string'
            ? params.value.split(",")
            : [];

        return (
          <Box>
            {availabilities.map((timeStamp: string, idx: number) => (
              <Box key={idx}>{timeStamp}</Box>
            ))}
          </Box>
        );
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
        .then((pi) => setPageInfo(pi))
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
