/**
 * SessionsTable.tsx
 * 
 * Example of integrating tickets with data-grid
 */
import { useContext, useEffect, useState } from 'react';

// material-ui
import {
    Box,
    Button,
    Stack
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRowSelectionModel,
    GridSortModel,
    useGridApiRef
} from '@mui/x-data-grid';

// third-party

// project import
import { useNavigate } from 'react-router';
import { studentService } from '../../api/ceStudentService';
import { LoadingContext } from '../../components/contexts/LoadingContext';
import { RefreshContext } from '../../components/contexts/RefreshContext';
import { PageInfo, QueryModel } from '../../services/supabaseClient';
import { StarFilled } from '@ant-design/icons';


const PAGE_SIZE = 10;

const getColumns = (): GridColDef[] => {
    return [
        {
            field: 'anchor',
            headerName: 'Anchor',
            width: 100,
            renderCell: (param: any) => {
                console.log("param", param.row)
                return <StarFilled style={{ color: "gray" }} />
            }
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 150,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 140,
        },
        {
            field: 'city',
            headerName: 'City',
            width: 140,
        },
        {
            field: 'country',
            headerName: 'Country',
            width: 140,
        },
        {
            field: 'availability',
            headerName: 'Availability',
            width: 140,
        }
    ];
}


export default function StudentsTable() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
    const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });
    const apiRef = useGridApiRef();
    const { setLoading } = useContext(LoadingContext);
    const { refresh } = useContext(RefreshContext);
    // const { data: statuses } = useAppConstants('STATUS')
    const navigate = useNavigate();

    useEffect(() => {
        if (paginationModel && sortModel) {
            const queryModel = {
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                sortField: sortModel.length === 0 ? 'created_at' : sortModel[0].field,
                sortDirection: sortModel.length === 0 ? 'created_at' : sortModel[0].sort
            } as QueryModel
            studentService.find(queryModel)
                .then((sess) => setPageInfo(sess))
        }
    }, [paginationModel, sortModel])

    useEffect(() => {
        const queryModel = {
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            sortField: sortModel.length === 0 ? 'created_at' : sortModel[0].field,
            sortDirection: sortModel.length === 0 ? 'created_at' : sortModel[0].sort
        } as QueryModel
        setLoading(true);
        studentService.find(queryModel)
            .then((pi) => setPageInfo(pi))
            .finally(() => setLoading(false))

    }, [refresh])

    const applyAction = () => {
        alert(`Apply some action to ${rowSelectionModel ? rowSelectionModel.length : 0} items.`)
    }

    const newSession = () => {
        alert(`New Session not implemented`)
    }

    function handleRowClick(params: any, event: any, details: any): void {
        console.log(params, event, details)
        navigate(`/session/${params.row.id}`)
    }

    return (
        <Box>
            <Stack margin="1" gap="1" direction="row" spacing={'1rem'}>
                <Button
                    title='Add Student'
                    variant="contained"
                    color="primary"
                    onClick={newSession}>
                    {'Add Student'}
                </Button>
                <Button
                    title='Action'
                    variant="contained"
                    color="secondary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={applyAction}>
                    {'Action'}
                </Button>
            </Stack>
            <DataGrid
                apiRef={apiRef}
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
                checkboxSelection
                onRowSelectionModelChange={setRowSelectionModel}
                disableRowSelectionOnClick={false}
                onRowClick={handleRowClick}
            />
        </Box>
    );
}
