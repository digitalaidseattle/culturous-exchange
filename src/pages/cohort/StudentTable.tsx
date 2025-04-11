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
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";

// third-party

// project import
import { PageInfo } from "@digitalaidseattle/supabase";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";

import { CohortContext } from ".";
import { cohortService } from "../../api/ceCohortService";
import { studentService } from "../../api/ceStudentService";
import { Identifier, Student } from "../../api/types";
import AddStudentModal from "../../components/AddStudentModal";

const PAGE_SIZE = 10;

export const StudentTable: React.FC = () => {
  const apiRef = useGridApiRef();
  const { cohort } = useContext(CohortContext);
  const notifications = useNotifications();
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "created_at", sort: "desc" },
  ]);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>();
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({
    rows: [],
    totalRowCount: 0,
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [unEnrolled, setUnenrolled] = useState<Student[]>([]);


  useEffect(() => {
      setPageInfo({
          rows: cohort.students ?? [],
          totalRowCount: cohort.students ? cohort.students.length : 0
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

  const handleAddStudent = (studentIds: string[]) => {
      cohortService.addStudents(cohort, studentIds)
          .then((resp) => {
              console.log(resp);
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

  const getColumns = (): GridColDef[] => {
    return [
      {
        field: "student.name",
        headerName: "Name",
        width: 150,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.name}</Typography>;
        },
      },
      {
        field: "email",
        headerName: "Email",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.email}</Typography>;
        },
      },
      {
        field: "city",
        headerName: "City",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.city}</Typography>;
        },
      },
      {
        field: "country",
        headerName: "Country",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.country}</Typography>;
        },
      },
      {
        field: "availability",
        headerName: "Availability",
        width: 140,
      },
    ];
  };

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
          </Stack>
          {cohort &&
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
      </Box>
  );
}
