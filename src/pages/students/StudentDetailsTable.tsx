import { useContext, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import {
  DataGrid,
  GridColDef,
  GridSortModel,
} from '@mui/x-data-grid';

import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { studentService } from '../../api/ceStudentService';
import { LoadingContext } from '@digitalaidseattle/core';
import { Stack } from '@mui/material';

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

const StudentDetailsTable: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });
  const { setLoading } = useContext(LoadingContext);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    setLoading(true);
    try {
      const successCount = await studentService.insert_from_excel(file);
      console.log(`Successfully inserted ${successCount} students.`);
      // Refresh the table data after insertion
      const queryModel = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortField: sortModel.length === 0 ? 'name' : sortModel[0].field,
        sortDirection: sortModel.length === 0 ? 'asc' : sortModel[0].sort,
      } as QueryModel;
      const pi = await studentService.find(queryModel);
      setPageInfo(pi);
    } catch (err) {
      console.error('Error processing uploaded file:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paginationModel && sortModel) {
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
  }, [paginationModel, sortModel]);

  return (
    <Box>
      <Stack spacing={2} m={2}>
        <input
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={(e) => handleUpload(e)}
        />
      </Stack>
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
    </Box>
  );
};

export default StudentDetailsTable;
