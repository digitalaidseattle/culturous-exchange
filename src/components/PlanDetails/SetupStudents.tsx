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
    Stack
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridRowId,
    GridRowSelectionModel,
    GridSortModel,
    useGridApiRef
} from '@mui/x-data-grid';

// third-party

// project import
import { ExclamationCircleFilled, StarFilled } from '@ant-design/icons';
import { PageInfo } from '@digitalaidseattle/supabase';
import { PlanProps } from '../../utils/props';

const PAGE_SIZE = 10;

type EnrolledStudent = Student & { enrollmentId: string, anchor: boolean, priority: boolean }

export const SetupStudents: React.FC<PlanProps> = ({ plan }) => {

    const apiRef = useGridApiRef();

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
    const [pageInfo, setPageInfo] = useState<PageInfo<EnrolledStudent>>({ rows: [], totalRowCount: 0 });

    useEffect(() => {
        const enrolledStudents = plan.enrollments.map(en => {
            return {
                ...en.student,
                enrollmentId: en.id,
                anchor: en.anchor,
                priority: en.priority,
            }
        });
        setPageInfo({
            rows: enrolledStudents,
            totalRowCount: enrolledStudents.length
        })
    }, [plan])

    const applyAnchor = () => {
        rowSelectionModel?.forEach((n: GridRowId) => {
            const row = pageInfo.rows.find(r => r.id === n)
            if (row) {
                row.anchor = true;
            }
        })
        setPageInfo({ ...pageInfo });
    }

    const applyPriority = () => {
        rowSelectionModel?.forEach((n: GridRowId) => {
            const row = pageInfo.rows.find(r => r.id === n)
            if (row) {
                row.priority = true;
            }
        })
        setPageInfo({ ...pageInfo });
    }

    const addStudent = () => {
        alert(`Add student not implemented yet`)
    }

    const removeStudent = () => {
        alert(`Remove student not implemented yet`)
    }

    const toggleAnchor = (student: EnrolledStudent) => {
        student.anchor = !student.anchor;
        setPageInfo({ ...pageInfo });
    }

    const togglePriority = (student: EnrolledStudent) => {
        student.priority = !student.priority
        setPageInfo({ ...pageInfo });
    }

    const getColumns = (): GridColDef[] => {
        return [
            {
                field: 'anchor',
                headerName: 'Anchor',
                width: 100,
                type: 'boolean',
                renderCell: (param: GridRenderCellParams) => {
                    return <StarFilled
                        style={{ fontSize: '150%', color: param.row.anchor ? "green" : "gray" }}
                        onClick={() => toggleAnchor(param.row)} />
                }
            },
            {
                field: 'priority',
                headerName: 'Priority',
                width: 100,
                type: 'boolean',
                renderCell: (param: GridRenderCellParams) => {
                    return <ExclamationCircleFilled
                        style={{ fontSize: '150%', color: param.row.priority ? "green" : "gray" }}
                        onClick={() => togglePriority(param.row)} />
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
                    title='RemoveStudent'
                    variant="contained"
                    color="primary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={removeStudent}>
                    {'Remove student'}
                </Button>
                <Button
                    title='Set Anchor'
                    variant="contained"
                    color="primary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={applyAnchor}>
                    {'Set as anchor'}
                </Button>
                <Button
                    title='Set Priority'
                    variant="contained"
                    color="primary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={applyPriority}>
                    {'Set as priority'}
                </Button>
            </Stack>
            {plan &&
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
                    disableRowSelectionOnClick={true}
                />
            }
        </Box>
    );
}
