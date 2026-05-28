/**
 * StudentTable.tsx
 *
 * Example of integrating tickets with data-grid
 * 
 * @copyright 2026 Digital Aid Seattle
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
import { StarFilled } from "@ant-design/icons";

// project import
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { PageInfo } from "@digitalaidseattle/supabase";

import { CohortContext } from ".";
import { CEStudentDao } from "../../api/ceStudentDao";
import { CEProfile, Enrollment, FailedProfile, Student } from "../../api/types";
import AddProfileModal from "../../components/AddProfileModal";
import DisplayTimeWindow from "../../components/DisplayTimeWindow";
import FailedUploadModal from "../../components/FailedUploadModal";
import FileUploader from "../../components/FileUploader";
import { ShowLocalTimeContext } from "../../components/ShowLocalTimeContext";
import { TimeToggle } from "../../components/TimeToggle";
import { DEFAULT_TABLE_PAGE_SIZE, SERVICE_ERRORS, UI_STRINGS } from '../../constants';
import { removeStudentsFromCohort } from "../../services/cohort/removeStudentsFromCohort";
import { addStudentsToCohort } from "../../services/cohort/addStudentsToCohort";
import { CohortUploadResult, uploadStudentsToCohort } from "../../services/cohort/uploadStudentsToCohort";
import { CEEnrollmentService } from "../../api/ceEnrollmentDao";

export const StudentTable: React.FC = () => {
  const studentDao = CEStudentDao.getInstance();
  const enrollmentService = CEEnrollmentService.getInstance();

  const apiRef = useGridApiRef();
  const { cohort } = useContext(CohortContext);
  const notifications = useNotifications();
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "created_at", sort: "desc" }]);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
  const [pageInfo, setPageInfo] = useState<PageInfo<Enrollment>>({ rows: [], totalRowCount: 0, });

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [unEnrolled, setUnenrolled] = useState<Student[]>([]);

  const [showLocalTime, setShowLocalTime] = useState<boolean>(false);

  // CEMT-138: cohort-level spreadsheet upload state
  const [showDropzone, setShowDropzone] = useState<boolean>(false);
  const [failedProfiles, setFailedProfiles] = useState<FailedProfile[]>([]);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setPageInfo({
      rows: cohort.enrollments ?? [],
      totalRowCount: cohort.enrollments ? cohort.enrollments.length : 0
    })
  }, [cohort])

  const addStudent = () => {
    studentDao.findUnenrolled()
      .then(students => {
        setUnenrolled(students);
        setShowAddStudent(true);
      })
  }

  const handleCloseStudentModal = () => {
    setShowAddStudent(false);
  }

  const handleAddStudent = (students: CEProfile[]) => {
    addStudentsToCohort(cohort, students as Student[])
      .then(() => {
        notifications.success(UI_STRINGS.STUDENTS_ADDED);
        setRefresh(refresh + 1);
        setShowAddStudent(false);
      })
      .catch((err) => {
        notifications.error(UI_STRINGS.ERROR_ADDING_STUDENTS);
        console.error(err);
      })
  }

  // CEMT-138: upload a student spreadsheet and enroll the created students into this cohort
  async function handleUpload(files: File[]): Promise<void> {
    uploadStudentsToCohort(cohort, files)
      .then((result) => displayUploadResults(result))
      .catch((err) => {
        console.error('Unexpected Error: ', err);
        notifications.error(UI_STRINGS.ERROR_ADDING_STUDENTS);
        setShowDropzone(false);
      })
      .finally(() => {
        setRefresh(refresh + 1);
      });
  }

  function displayUploadResults(resp: CohortUploadResult) {
    setShowDropzone(false);
    if (resp.failedCount === resp.attemptedCount) {
      notifications.error(`Error uploading spreadsheet. Failed to add ${resp.successCount} of ${resp.attemptedCount}`);
      setFailedProfiles(resp.failedProfiles);
      setIsFailedModalOpen(true);
    } else if (resp.failedCount > 0) {
      setFailedProfiles(resp.failedProfiles);
      setIsFailedModalOpen(true);
      notifications.warn(`${resp.attemptedCount} Attempted, ${resp.successCount} added, ${resp.failedCount} failed.`);
    } else {
      notifications.success(`${resp.attemptedCount} Attempted, ${resp.successCount} successfully added`);
    }
  }

  const doDelete = () => {
    removeStudentsFromCohort(cohort, Array.from(rowSelectionModel!.ids))
      .then(() => {
        notifications.success(UI_STRINGS.STUDENTS_REMOVED);
        setRefresh(refresh + 1);
        setOpenDeleteDialog(false);
      });
  };

  const removeStudent = () => {
    setOpenDeleteDialog(true);
  };


  const toggleAnchor = async (enrollment: Enrollment) => {
    // Optimistically update UI so the change persists across pagination
    const originalRows = pageInfo.rows;
    const updatedRows = pageInfo.rows.map((r) =>
      r.student_id === enrollment.student_id ? { ...r, anchor: !r.anchor } : r
    );

    try {
      setPageInfo({ ...pageInfo, rows: updatedRows });

      await enrollmentService.updateEnrollment(enrollment.cohort_id, enrollment.student_id, { anchor: !enrollment.anchor });

      // trigger a refresh to sync any other derived state
      setRefresh(refresh + 1);
    } catch (error) {
      console.error(SERVICE_ERRORS.ERROR_TOGGLING_ANCHOR, error);
      notifications.error(UI_STRINGS.FAILED_UPDATE_ANCHOR);
      // Revert optimistic update on error
      setPageInfo({ ...pageInfo, rows: originalRows });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "student.name",
      headerName: UI_STRINGS.NAME,
      width: 150,
      renderCell: (param: GridRenderCellParams) => {
        return <Typography>{param.row.student.name}</Typography>;
      },
      valueGetter: (_value, row) => row.student.name,
    },
    {
      field: "student.email",
      headerName: UI_STRINGS.EMAIL,
      width: 240,
      renderCell: (param: GridRenderCellParams) => {
        return <Typography>{param.row.student.email}</Typography>;
      },
      valueGetter: (_value, row) => row.student.email,

    },

    {
      field: "student.country",
      headerName: UI_STRINGS.COUNTRY,
      width: 140,
      renderCell: (param: GridRenderCellParams) => {
        return <Typography>{param.row.student.country}</Typography>;
      },
      valueGetter: (_value, row) => row.student.country,
    },
    {
      field: "anchor",
      headerName: UI_STRINGS.ANCHOR,
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
      headerName: UI_STRINGS.AGE,
      width: 75,
      type: 'number',
      filterOperators: getGridNumericOperators()
        .filter((operator) => studentDao.supportedNumberFilters().includes(operator.value)),
      renderCell: (param: GridRenderCellParams) => {
        return <Typography>{param.row.student.age}</Typography>;
      },
      valueGetter: (_value, row) => row.student.age,
    },
    {
      field: 'student.gender',
      headerName: UI_STRINGS.GENDER,
      width: 100,
      filterOperators: getGridStringOperators()
        .filter((operator) => studentDao.supportedStringFilters().includes(operator.value)),
      renderCell: (param: GridRenderCellParams) => {
        return <Typography>{param.row.student.gender}</Typography>;
      },
      valueGetter: (_value, row) => row.student.gender,
    },
    {
      field: 'timeWindows',
      headerName: UI_STRINGS.AVAILABILITIES,
      width: 250,
      renderCell: (params) => {
        const timeWindows = Array.isArray(params.row.student.timeWindows) ? params.row.student.timeWindows : [];
        return <DisplayTimeWindow timeWindows={timeWindows} timezone={params.row.student.time_zone} />
      },
      filterable: false
    }
  ];

  return (
    <Box>
      <ShowLocalTimeContext.Provider value={{ showLocalTime, setShowLocalTime }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack margin={1} gap={1} direction="row" spacing={'1rem'}>
            <Button
              title={UI_STRINGS.UPLOAD}
              variant="contained"
              color="primary"
              onClick={() => setShowDropzone(!showDropzone)}>
              {UI_STRINGS.UPLOAD}
            </Button>
            <Button
              title={UI_STRINGS.ADD_STUDENT}
              variant="contained"
              color="primary"
              onClick={addStudent}>
              {UI_STRINGS.ADD_STUDENT}
            </Button>
            <Button
              title={UI_STRINGS.REMOVE_STUDENT}
              variant="contained"
              color="primary"
              disabled={!(rowSelectionModel && rowSelectionModel.ids.size > 0)}
              onClick={removeStudent}>
              {UI_STRINGS.REMOVE_STUDENT}
            </Button>
          </Stack>
          <TimeToggle />
        </Stack>
        {showDropzone &&
          <FileUploader onChange={handleUpload} />
        }
        {cohort &&
          <DataGrid
            apiRef={apiRef}
            rows={pageInfo.rows}
            getRowId={(row) => row.student_id}
            columns={columns}

            paginationMode='client'
            paginationModel={paginationModel}
            rowCount={pageInfo.totalRowCount}
            onPaginationModelChange={setPaginationModel}

            sortingMode='client'
            sortModel={sortModel}
            onSortModelChange={setSortModel}

            pageSizeOptions={[5, 10, 25, 100]}
            checkboxSelection
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={setRowSelectionModel}
            disableRowSelectionOnClick={true}
          />
        }
        <ConfirmationDialog
          message={UI_STRINGS.DELETE_SELECTED_STUDENTS_CONFIRM}
          open={openDeleteDialog}
          handleConfirm={() => doDelete()}
          handleCancel={() => setOpenDeleteDialog(false)} />
        <AddProfileModal
          title={UI_STRINGS.ADD_STUDENT}
          profiles={unEnrolled}
          isOpen={showAddStudent}
          onClose={handleCloseStudentModal}
          onSubmit={handleAddStudent} />
        <FailedUploadModal
          isModalOpen={isFailedModalOpen}
          onClose={() => setIsFailedModalOpen(false)}
          failedProfiles={failedProfiles}
        />
      </ShowLocalTimeContext.Provider>
    </Box>
  );
}
