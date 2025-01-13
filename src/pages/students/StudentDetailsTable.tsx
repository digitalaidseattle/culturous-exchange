import { useContext, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import {
  DataGrid,
  GridColDef,
  GridSortModel,
} from '@mui/x-data-grid';

import { PageInfo, QueryModel } from '../../services/supabaseClient';
import { studentService } from '../../api/ceStudentService';
import { LoadingContext } from '../../components/contexts/LoadingContext';
import { Stack } from '@mui/material';

const PAGE_SIZE = 10;

const getColumns = (): GridColDef[] => {
  return [
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
      field: 'country',
      headerName: 'Country',
      width: 150,
    },
  ]
}

const StudentDetailsTable: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });
  const { setLoading } = useContext(LoadingContext);

  // const [newStudentData, setNewStudentData] = useState<Student[]>();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    // const file = e.target.files[0];
    //send to student service that will validate, parse, update, and return the data from the database
    //if newStudentData
      //set in newStudentData state
      //spread newStudentData with pageInfo
  }

  useEffect(() => {
    if (paginationModel && sortModel) {
      setLoading(true);
        const queryModel = {
          page: paginationModel.page,
          pageSize: paginationModel.pageSize,
          sortField: sortModel.length === 0 ? 'name' : sortModel[0].field,
          sortDirection: sortModel.length === 0 ? 'asc' : sortModel[0].sort
        } as QueryModel
        studentService.find(queryModel)
          .then((pi) => setPageInfo(pi))
          .catch((err) => console.error(err))
          .finally(() => setLoading(false))
    }
  }, [paginationModel, sortModel])


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

        paginationMode='server'
        paginationModel={paginationModel}
        rowCount={pageInfo.totalRowCount}
        onPaginationModelChange={setPaginationModel}

        sortingMode='server'
        sortModel={sortModel}
        onSortModelChange={setSortModel}

        pageSizeOptions={[5, 10, 25, 100]}
      />
    </Box>
  )
}

export default StudentDetailsTable;