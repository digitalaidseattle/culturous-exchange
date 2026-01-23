/**
 * CohortsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

// material-ui
import {
    Typography
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridSortModel,
    useGridApiRef
} from '@mui/x-data-grid';

// third-party

// project import
import { LoadingContext, RefreshContext } from '@digitalaidseattle/core';
import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { useNavigate } from 'react-router';
import { cohortService } from '../../api/ceCohortService';
import { UI_STRINGS } from '../../constants';
import { Cohort, Plan } from '../../api/types';
import { MainCard } from '@digitalaidseattle/mui';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../constants';

const getColumns = (): GridColDef[] => {
    return [
        {
            field: 'name',
            headerName: UI_STRINGS.NAME,
            width: 150,
        },
        {
            field: 'plans',
            headerName: UI_STRINGS.PLANS_LABEL,
            renderCell: (param: any) => {
                return <Typography>{param.row.plans.map((p: Plan) => p.name).join(', ')}</Typography>
            }
        }
    ];
}


export default function CohortsTable() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE });
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

    function handleRowClick(params: any, _event: any, _details: any): void {
        navigate(`/cohort/${params.row.id}`)
    }

    return (pageInfo.rows.length > 0 &&
        <MainCard>
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
        </MainCard>
    );
}
