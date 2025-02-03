/**
 * CohortsTable.tsx
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
            field: 'startDate',
            headerName: 'Start Date',
            width: 140,
        },
        {
            field: 'endDate',
            headerName: 'End Date',
            width: 140,
        }
    ];
}


export default function CohortsTable() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
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

    const applyAction = () => {
        alert(`Apply some action to ${rowSelectionModel ? rowSelectionModel.length : 0} items.`)
    }

    const newCohort = () => {
        alert(`New Cohort not implemented`)
    }

    function handleRowClick(params: any, event: any, details: any): void {
        console.log(params, event, details)
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
