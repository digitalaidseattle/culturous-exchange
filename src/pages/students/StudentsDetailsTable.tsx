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
  GridColDef,
  GridSortModel,
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
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 150,
    },
    {
      field: 'city',
      headerName: 'City',
      width: 150,
    },
    {
      field: 'state',
      headerName: 'State',
      width: 150,
    },
    {
      field: 'country',
      headerName: 'Country',
      width: 150,
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
    }
  ];
};

const StudentsDetailsTable: React.FC = () => {
  const { setLoading } = useContext(LoadingContext);
  const { refresh } = useContext(RefreshContext);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });

  useEffect(() => {
    if (refresh && paginationModel && sortModel) {
      setLoading(true);
      const queryModel = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortField: sortModel.length === 0 ? 'name' : sortModel[0].field,
        sortDirection: sortModel.length === 0 ? 'asc' : sortModel[0].sort,
      } as QueryModel;
      studentService
        .find(queryModel)
        .then((pi) => setPageInfo(pi))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [refresh, paginationModel, sortModel]);

  return (
    <DataGrid
      rows={pageInfo.rows}
      columns={getColumns()}
      paginationMode="server"
      paginationModel={paginationModel}
      rowCount={pageInfo.totalRowCount}
      onPaginationModelChange={setPaginationModel}
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      pageSizeOptions={[5, 10, 25, 100]}
    />
  );
};

export default StudentsDetailsTable;
