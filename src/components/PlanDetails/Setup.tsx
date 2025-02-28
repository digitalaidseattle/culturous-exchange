/**
 * SetupPanel.tsx
 * 
 * Example of integrating tickets with data-grid
 */
import { useEffect, useState } from 'react';

// material-ui
import {
    Box,
    Button,
    Stack,
    Switch
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridRowSelectionModel,
    GridSortModel,
    useGridApiRef
} from '@mui/x-data-grid';

// third-party

// project import
import { StarFilled } from '@ant-design/icons';
import { PageInfo } from '@digitalaidseattle/supabase';
import { Placement, Plan } from '../../api/types';

const PAGE_SIZE = 10;

const getColumns = (): GridColDef[] => {
    return [
        {
            field: 'anchor',
            headerName: 'Anchor',
            width: 100,
            type: 'boolean',
            renderCell: (_param: GridRenderCellParams) => {
                return <StarFilled style={{ color: "gray" }} />
            }
        }, {
            field: 'priority',
            headerName: 'Priority',
            width: 100,
            type: 'boolean',
            renderCell: (_param: GridRenderCellParams) => {
                return <Switch />
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

export default function Setup(props: { plan: Plan }) {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
    const [pageInfo, setPageInfo] = useState<PageInfo<Placement>>({ rows: [], totalRowCount: 0 });
    const apiRef = useGridApiRef();

    useEffect(() => {
        if (props.plan) {
            console.log(props.plan)
            setPageInfo(
                {
                    ...pageInfo,
                    rows: props.plan.placements,
                    totalRowCount: props.plan.placements.length
                }
            )
        }
    }, [props])

    const applyAction = () => {
        alert(`Apply some action to ${rowSelectionModel ? rowSelectionModel.length : 0} items.`)
    }

    const addStudent = () => {
        alert(`Add student not implemented`)
    }

    return (
        <Box>
            <Stack margin={1} gap={1} direction="row" spacing={'1rem'}>
                <Button
                    title='Add Student'
                    variant="contained"
                    color="primary"
                    onClick={addStudent}>
                    {'Add Student'}
                </Button>
                <Button
                    title='Set Anchor'
                    variant="contained"
                    color="primary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={applyAction}>
                    {'Set as anchor'}
                </Button>
                <Button
                    title='Set Priority'
                    variant="contained"
                    color="primary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={applyAction}>
                    {'Set as priority'}
                </Button>
            </Stack>
            <DataGrid
                apiRef={apiRef}
                rows={pageInfo.rows}
                columns={getColumns()}

                paginationMode='client'
                paginationModel={paginationModel}
                rowCount={pageInfo.totalRowCount}
                onPaginationModelChange={setPaginationModel}

                sortingMode='client'
                sortModel={sortModel}
                onSortModelChange={setSortModel}

                pageSizeOptions={[5, 10, 25, 100]}
                checkboxSelection
                onRowSelectionModelChange={setRowSelectionModel}
                disableRowSelectionOnClick={true}
            />
        </Box>
    );
}
