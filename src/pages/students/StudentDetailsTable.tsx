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