/**
 * CohortsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

// material-ui
import {
    Box,
    Button,
    Stack,
    Typography
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
import { cohortService } from '../../api/ceCohortService';
import {LoadingContext, RefreshContext } from '@digitalaidseattle/core';
import { PageInfo, QueryModel } from  '@digitalaidseattle/supabase';

const PAGE_SIZE = 10;

const getColumns = (): GridColDef[] => {
    return [
        {
            field: 'name',
            headerName: 'Name',
            width: 150,
        },
        {
            field: 'plans',
            headerName: 'Plans',
            renderCell: (param: any) => {
                return <Typography>{param.row.plans.map((p: Plan) => p.name).join(', ')}</Typography>
            }
        }
    ];
}


export default function CohortsTable() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [pageInfo, setPageInfo] = useState<PageInfo<Cohort>>({ rows: [], totalRowCount: 0 });
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
            cohortService.find(queryModel)
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
        cohortService.find(queryModel)
            .then((pi) => setPageInfo(pi))
            .finally(() => setLoading(false))

    }, [refresh])

    const newCohort = () => {
        navigate(`/cohort/new`)
    }

    function handleRowClick(params: any, _event: any, _details: any): void {
        navigate(`/cohort/${params.row.id}`)
    }

    return (
        <Box>
            <Stack margin="1" gap="1" direction="row" spacing={'1rem'}>
                <Button
                    title='Action'
                    variant="contained"
                    color="primary"
                    onClick={newCohort}>
                    {'New'}
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

                disableRowSelectionOnClick={false}
                onRowClick={handleRowClick}
            />
        </Box>
    );
}
