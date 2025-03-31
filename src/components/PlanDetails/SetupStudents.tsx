/**
 * SetupPanel.tsx
 *
 * Example of integrating tickets with data-grid
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
import { placementService } from '../../api/cePlacementService';
import { planService } from '../../api/cePlanService';
import { Placement } from '../../api/types';
import { PlanContext } from '../../pages/plan';
import AddStudentModal from '../../components/AddStudentModal';

// TODO delete temp
import { cohortService } from '../../api/ceCohortService';
import { Student } from '../../api/types';
import { CohortContext } from '../../pages/cohort';
import { studentService } from '../../api/ceStudentService';

const PAGE_SIZE = 10;

export const SetupStudents: React.FC = () => {

    const apiRef = useGridApiRef();

    const { plan, setPlan } = useContext(PlanContext);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
    const [pageInfo, setPageInfo] = useState<PageInfo<Placement>>({ rows: [], totalRowCount: 0 });

    // TODO : New
    const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
    const [unEnrolled, setUnenrolled] = useState<Student[]>([]);

    // Temp
    const { cohort } = useContext(CohortContext);

    useEffect(() => {
        placementService.getStudents(plan)
            .then(students => {
                const placedStudents = plan.placements.map(placement => {
                    return {
                        ...placement,
                        student: students.find(student => student.id === placement.student_id)
                    } as Placement
                });
                setPageInfo({
                    rows: placedStudents,
                    totalRowCount: placedStudents.length
                })
            })
            // TODO change this to get all students in cohort
            studentService.findUnenrolled()
                .then(students => setUnenrolled(students))
    }, [plan])

    const applyAnchor = () => {
        rowSelectionModel?.forEach((n: GridRowId) => {
            const row = pageInfo.rows.find(r => r.id === n)
            if (row) {
                row.anchor = true;
            }
        })
        // TODO save
        setPageInfo({ ...pageInfo });
    }

    const applyPriority = () => {
        rowSelectionModel?.forEach((n: GridRowId) => {
            const row = pageInfo.rows.find(r => r.id === n)
            if (row) {
                row.priority = 1;
            }
        })
        // TODO save
        setPageInfo({ ...pageInfo });
    }

    const addStudent = () => {
        setShowAddStudent(true)
    }

    const handleCloseStudentModal = () => {
      setShowAddStudent(false)
  }

  // TODO Change cohort to Plan
  function handleSubmit(studentIds: string[]) {
    cohortService.addStudents(cohort, studentIds)
        .then((resp) => {
            console.log(resp)
        });
}

    const removeStudent = () => {
      // .deleteEnrollment(enrollments)
      alert(`Remove student not implemented yet`)
  }


    const toggleAnchor = (placement: Placement) => {
        placementService.updatePlacement(placement.plan_id, placement.student_id, { anchor: !placement.anchor })
            .then(() => {
                // TODO be smarter about updating
                planService.getById(plan.id!)
                    .then(updated => setPlan({ ...updated! }))
            })
    }

    const togglePriority = (placement: Placement) => {
        placementService.updatePlacement(placement.plan_id, placement.student_id, { priority: placement.priority === 0 ? 1 : 0 })
            .then(() => {
                // TODO be smarter about updating
                planService.getById(plan.id!)
                    .then(updated => setPlan({ ...updated! }))
            })
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
                        style={{ fontSize: '150%', color: param.row.priority === 1 ? "green" : "gray" }}
                        onClick={() => togglePriority(param.row)} />
                }
            },
            {
                field: 'student.name',
                headerName: 'Name',
                width: 150,
                renderCell: (param: GridRenderCellParams) => {
                    return <Typography>{param.row.student.name}</Typography>
                }
            },
            {
                field: 'email',
                headerName: 'Email',
                width: 140,
                renderCell: (param: GridRenderCellParams) => {
                    return <Typography>{param.row.student.email}</Typography>
                }
            },
            {
                field: 'city',
                headerName: 'City',
                width: 140,
                renderCell: (param: GridRenderCellParams) => {
                    return <Typography>{param.row.student.city}</Typography>
                }
            },
            {
                field: 'country',
                headerName: 'Country',
                width: 140,
                renderCell: (param: GridRenderCellParams) => {
                    return <Typography>{param.row.student.country}</Typography>
                }
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
                    getRowId={row => row.plan_id + ':' + row.student_id}
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
            <AddStudentModal
                students={unEnrolled} // TODO change to all students in cohort ID
                isOpen={showAddStudent}
                onClose={handleCloseStudentModal}
                onSubmit={handleSubmit} />
        </Box>
    );
}
