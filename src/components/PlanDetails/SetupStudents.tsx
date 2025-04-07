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
  GridRowId,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";

// third-party

// project import
import { ExclamationCircleFilled, StarFilled } from "@ant-design/icons";
import { PageInfo } from "@digitalaidseattle/supabase";
import { placementService } from "../../api/cePlacementService";
import { planService } from "../../api/cePlanService";
import { Cohort, Placement, Identifier } from "../../api/types";
import plan, { PlanContext } from "../../pages/plan";
import AddStudentModal from "../../components/AddStudentModal";
import { ConfirmationDialog } from "@digitalaidseattle/mui";

// TODO delete temp
import { cohortService } from "../../api/ceCohortService";
import { Student } from "../../api/types";
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { CohortContext } from "../../pages/cohort";
import { studentService } from "../../api/ceStudentService";

const PAGE_SIZE = 10;

export const SetupStudents: React.FC = () => {
  const apiRef = useGridApiRef();
  const notifications = useNotifications();

  const { plan, setPlan } = useContext(PlanContext);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "created_at", sort: "desc" },
  ]);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>();
  const [pageInfo, setPageInfo] = useState<PageInfo<Placement>>({
    rows: [],
    totalRowCount: 0,
  });

  // TODO : New
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [unEnrolled, setUnenrolled] = useState<Student[]>([]);
  const { refresh, setRefresh } = useContext(RefreshContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temp
  const [cohort, setCohort] = useState<Cohort | null>(null);

  // Whenever the plan changes, it grabs all the students assigned in that plan,
  //   and enriches the placements with the full student info
  //   — by matching placement.student_id to the actual Student object.
  useEffect(() => {
    if (!plan?.cohort_id) return;

    cohortService.getById(plan.cohort_id)
      .then((cohort) => {
        if (cohort) setCohort(cohort);
        else console.warn("Cohort not found");
      })
      .catch((error) => console.error("Error fetching cohort:", error));
  }, [plan?.cohort_id]); // ✅ only run when cohort ID changes

  useEffect(() => {
    console.log('⏳ useEffect triggered:', { plan, cohort });

    if (plan && cohort) {
      placementService.getStudents(plan).then((students) => {
        const placedStudents = plan.placements.map((placement) => {
          return {
            ...placement,
            student: students.find(
              (student) => student.id === placement.student_id
            ),
          } as Placement;
        });

        console.log("Plan: ", plan);
        console.log("Placed Students: ", placedStudents);

        setPageInfo({
          rows: placedStudents,
          totalRowCount: placedStudents.length,
        });
      });

      placementService
        .getUnplacedStudents(cohort, plan)
        .then((students) => setUnenrolled(students));
    }
  }, [plan, cohort]);

  const applyAnchor = () => {
    rowSelectionModel?.forEach((n: GridRowId) => {
      const row = pageInfo.rows.find((r) => r.id === n);
      if (row) {
        row.anchor = true;
      }
    });
    // TODO save
    setPageInfo({ ...pageInfo });
  };

  const applyPriority = () => {
    rowSelectionModel?.forEach((n: GridRowId) => {
      const row = pageInfo.rows.find((r) => r.id === n);
      if (row) {
        row.priority = 1;
      }
    });
    // TODO save
    setPageInfo({ ...pageInfo });
  };

  const addStudent = () => {
    console.log(cohort);
    setShowAddStudent(true);
  };

  const handleCloseStudentModal = () => {
    setShowAddStudent(false);
  };

  async function handleSubmit(studentIds: string[]) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const resp = await planService.addStudents(plan, studentIds);
      console.log(resp);

      const updated = await planService.getById(plan.id!);
      console.log("Updated plan: ", updated);
      setRefresh(refresh + 1);
      if (updated) {
        setPlan(updated);
      }

    } catch (error) {
      console.error("Error submitting students to plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const removeStudent = () => {
    setOpenDeleteDialog(true);
  };

  const doDelete = () => {
    if (!rowSelectionModel) return;

    const studentIds = rowSelectionModel.map(
      (id) => (id as string).split(":")[1]
    );

    planService.removeStudents(plan, studentIds).then(() => {
      notifications.success("Students removed.");
      // Refresh the plan data
      planService.getById(plan.id!).then((updated) => setPlan({ ...updated! }));
    });
    setRefresh(refresh + 1);
    setOpenDeleteDialog(false);
  };

  const toggleAnchor = (placement: Placement) => {
    placementService
      .updatePlacement(placement.plan_id, placement.student_id, {
        anchor: !placement.anchor,
      })
      .then(() => {
        // TODO be smarter about updating
        planService
          .getById(plan.id!)
          .then((updated) => setPlan({ ...updated! }));
      });
  };

  const togglePriority = (placement: Placement) => {
    placementService
      .updatePlacement(placement.plan_id, placement.student_id, {
        priority: placement.priority === 0 ? 1 : 0,
      })
      .then(() => {
        // TODO be smarter about updating
        planService
          .getById(plan.id!)
          .then((updated) => setPlan({ ...updated! }));
      });
  };

  const getColumns = (): GridColDef[] => {
    return [
      {
        field: "anchor",
        headerName: "Anchor",
        width: 100,
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
        },
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 100,
        type: "boolean",
        renderCell: (param: GridRenderCellParams) => {
          return (
            <ExclamationCircleFilled
              style={{
                fontSize: "150%",
                color: param.row.priority === 1 ? "green" : "gray",
              }}
              onClick={() => togglePriority(param.row)}
            />
          );
        },
      },
      {
        field: "student.name",
        headerName: "Name",
        width: 150,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.name}</Typography>;
        },
      },
      {
        field: "email",
        headerName: "Email",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.email}</Typography>;
        },
      },
      {
        field: "city",
        headerName: "City",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.city}</Typography>;
        },
      },
      {
        field: "country",
        headerName: "Country",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.country}</Typography>;
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
      <Stack margin={1} gap={1} direction="row" spacing={"1rem"}>
        <Button
          title="Add Student"
          variant="contained"
          color="primary"
          onClick={addStudent}
        >
          {"Add Student"}
        </Button>
        <Button
          title="RemoveStudent"
          variant="contained"
          color="primary"
          disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
          onClick={removeStudent}
        >
          {"Remove student"}
        </Button>
        <Button
          title="Set Anchor"
          variant="contained"
          color="primary"
          disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
          onClick={applyAnchor}
        >
          {"Set as anchor"}
        </Button>
        <Button
          title="Set Priority"
          variant="contained"
          color="primary"
          disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
          onClick={applyPriority}
        >
          {"Set as priority"}
        </Button>
      </Stack>
      {plan && (
        <DataGrid
          getRowId={(row) => row.plan_id + ":" + row.student_id}
          apiRef={apiRef}
          rows={pageInfo.rows}
          columns={getColumns()}
          paginationMode="server"
          paginationModel={paginationModel}
          rowCount={pageInfo.totalRowCount}
          onPaginationModelChange={setPaginationModel}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[5, 10, 25, 100]}
          checkboxSelection
          onRowSelectionModelChange={setRowSelectionModel}
          disableRowSelectionOnClick={true}
        />
      )}
      <ConfirmationDialog
        message={`Delete selected students?`}
        open={openDeleteDialog}
        handleConfirm={() => doDelete()}
        handleCancel={() => setOpenDeleteDialog(false)}
      />
      <AddStudentModal
        students={unEnrolled} // TODO change to all students in cohort ID
        isOpen={showAddStudent}
        onClose={handleCloseStudentModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};
