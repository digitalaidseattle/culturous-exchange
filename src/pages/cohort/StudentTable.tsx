/**
 * SetupPanel.tsx
 *
 * Example of integrating tickets with data-grid
 */
import { useContext, useEffect, useState } from "react";

// material-ui
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  getGridNumericOperators,
  getGridStringOperators,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";

// third-party

// project import
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { PageInfo } from "@digitalaidseattle/supabase";

import { StarFilled } from "@ant-design/icons";
import { CohortContext } from ".";
import { cohortService } from "../../api/ceCohortService";
import { enrollmentService } from "../../api/ceEnrollmentService";
import { studentService } from "../../api/ceStudentService";
import { Enrollment, Identifier, Student } from "../../api/types";
import AddStudentModal from "../../components/AddStudentModal";
import DisplayTimeWindow from "../../components/DisplayTimeWindow";
import { ShowLocalTimeContext } from "../../components/ShowLocalTimeContext";
import { TimeToggle } from "../../components/TimeToggle";

const PAGE_SIZE = 10;

export const StudentTable: React.FC = () => {
  const apiRef = useGridApiRef();
  const { cohort } = useContext(CohortContext);
  const notifications = useNotifications();
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "created_at", sort: "desc" }]);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
  const [pageInfo, setPageInfo] = useState<PageInfo<Enrollment>>({ rows: [], totalRowCount: 0, });

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [unEnrolled, setUnenrolled] = useState<Student[]>([]);

  const [showLocalTime, setShowLocalTime] = useState<boolean>(false);

  useEffect(() => {
    setPageInfo({
      rows: cohort.enrollments ?? [],
      totalRowCount: cohort.enrollments ? cohort.enrollments.length : 0
    })
  }, [cohort])

  const addStudent = () => {
    studentService.findUnenrolled()
      .then(students => {
        setUnenrolled(students);
        setShowAddStudent(true);
      })
  }

  const handleCloseStudentModal = () => {
    setShowAddStudent(false);
  }

  const handleAddStudent = (students: Student[]) => {
    cohortService.addStudents(cohort, students)
      .then(() => {
        notifications.success('Students added.');
        setRefresh(refresh + 1);
        setShowAddStudent(false);
      })
      .catch((err) => {
        notifications.error('Error adding students.');
        console.error(err);
      })
  }

  const doDelete = () => {
    cohortService
      .removeStudents(cohort, rowSelectionModel as Identifier[])
      .then(() => {
        notifications.success("Students removed.");
        setRefresh(refresh + 1);
        setOpenDeleteDialog(false);
      });
  };

  const removeStudent = () => {
    setOpenDeleteDialog(true);
  };


  const toggleAnchor = async (enrollment: Enrollment) => {
    try {
      enrollment.anchor = !enrollment.anchor;
      enrollmentService
        .updateEnrollment(enrollment.cohort_id, enrollment.student_id, { anchor: enrollment.anchor })
        .then(() => {
          // Optimistically update the pageInfo
          setRefresh(refresh + 1);
        });
    } catch (error) {
      console.error('Error toggling anchor:', error);
      notifications.error('Failed to update student anchor status');
      // Revert optimistic update
      setPageInfo({ ...pageInfo });
    }
  };

  const getColumns = (): GridColDef[] => {
    return [
      {
        field: "student.name",
        headerName: "Name",
        width: 150,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.name}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.name}`,
      },
      {
        field: "student.email",
        headerName: "Email",
        width: 240,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.email}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.email}`,
      },

      {
        field: "student.country",
        headerName: "Country",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.country}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.country}`
      },
      {
        field: "anchor",
        headerName: "Anchor",
        width: 75,
        type: "boolean",
        renderCell: (param: GridRenderCellParams) => {
          return (
            <StarFilled
              style={{
                fontSize: "150%",
                color: param.row.anchor ? "green" : "gray",
              }}
              onClick={() => toggleAnchor(param.row)}
            />
          );
        }
      },
      {
        field: 'student.age',
        headerName: 'Age',
        width: 75,
        type: 'number',
        filterOperators: getGridNumericOperators()
          .filter((operator) => studentService.supportedNumberFilters().includes(operator.value)),
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.age}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.age}`,
      },
      {
        field: 'student.gender',
        headerName: 'Gender',
        width: 100,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value)),
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.gender}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.gender}`,
      },
      {
        field: 'timeWindows',
        headerName: 'Availabilities',
        width: 250,
        renderCell: (params) => {
          const timeWindows = Array.isArray(params.row.student.timeWindows) ? params.row.student.timeWindows : [];
          return <DisplayTimeWindow timeWindows={timeWindows} timezone={params.row.student.time_zone} />
        },
        filterable: false
      }
    ];
  };

  return (
    <Box>
      <ShowLocalTimeContext.Provider value={{ showLocalTime, setShowLocalTime }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
          </Stack>
          <TimeToggle />
        </Stack>
        {cohort &&
          <DataGrid
            apiRef={apiRef}
            rows={pageInfo.rows}
            getRowId={(row) => row.student_id}
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
        }
        <ConfirmationDialog
          message={`Delete selected students?`}
          open={openDeleteDialog}
          handleConfirm={() => doDelete()}
          handleCancel={() => setOpenDeleteDialog(false)} />
        <AddStudentModal
          students={unEnrolled}
          isOpen={showAddStudent}
          onClose={handleCloseStudentModal}
          onSubmit={handleAddStudent} />
      </ShowLocalTimeContext.Provider>
    </Box>
  );
}
