/**
 * SetupPanel.tsx
 *
 * Example of integrating tickets with data-grid
 */
import React, { useContext, useEffect, useState } from "react";

// material-ui
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowSelectionModel,
  useGridApiRef
} from "@mui/x-data-grid";

// third-party

// project import
import { ExclamationCircleFilled, StarFilled } from "@ant-design/icons";
import { ConfirmationDialog } from "@digitalaidseattle/mui";
import { PageInfo } from "@digitalaidseattle/supabase";
import { placementService } from "../../api/cePlacementService";
import { planService } from "../../api/cePlanService";
import { Placement } from "../../api/types";
import AddStudentModal from "../../components/AddStudentModal";
import { PlanContext } from "../../pages/plan";

// TODO delete temp
import { RefreshContext, useNotifications } from "@digitalaidseattle/core";
import { Student } from "../../api/types";
import { CohortContext } from "../../pages/cohort";

const PAGE_SIZE = 10;

export const SetupStudents: React.FC = () => {
  const apiRef = useGridApiRef();
  const notifications = useNotifications();

  const { plan } = useContext(PlanContext);
  const { cohort } = useContext(CohortContext);
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [unEnrolled, setUnenrolled] = useState<Student[]>([]);

  const [columns, setColumns] = useState<GridColDef[]>([]);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>();
  const [pageInfo, setPageInfo] = useState<PageInfo<Placement>>({
    rows: [],
    totalRowCount: 0,
  });

  useEffect(() => {
    setColumns(getColumns());
  }, []);


  // Enrich the pageInfo with the placement students data
  useEffect(() => {
    console.log(plan)
    
    if (plan && cohort) {
      placementService.getEnrichedPlacements(plan).then((enrichedPlacements) => {
        setPageInfo({
          rows: enrichedPlacements,
          totalRowCount: enrichedPlacements.length,
        });
      });

      placementService
        .getUnplacedStudents(cohort, plan)
        .then((students) => setUnenrolled(students));
    }
  }, [plan, cohort]);

  const applyAnchor = async () => {
    if (!rowSelectionModel?.length) return;

    try {
      const promises = rowSelectionModel.map((n: GridRowId) => {
        const [planId, studentId] = (n as string).split(':');
        return placementService.updatePlacement(planId, studentId, { anchor: true });
      });

      await Promise.all(promises);
      notifications.success('Students set as anchors');
      
      // Optimistic update
      const updatedRows = pageInfo.rows.map((row: Placement) => {
        if (rowSelectionModel.includes(`${row.plan_id}:${row.student_id}`)) {
          return { ...row, anchor: true };
        }
        return row;
      });
      setPageInfo({ ...pageInfo, rows: updatedRows });
    } catch (error) {
      console.error('Error setting anchors:', error);
      notifications.error('Failed to set students as anchors');
    }
  };

  const applyPriority = async () => {
    if (!rowSelectionModel?.length) return;

    try {
      const promises = rowSelectionModel.map((n: GridRowId) => {
        const [planId, studentId] = (n as string).split(':');
        return placementService.updatePlacement(planId, studentId, { priority: 1 });
      });

      await Promise.all(promises);
      notifications.success('Students set as priority');
      
      // Optimistic update
      const updatedRows = pageInfo.rows.map((row: Placement) => {
        if (rowSelectionModel.includes(`${row.plan_id}:${row.student_id}`)) {
          return { ...row, priority: 1 };
        }
        return row;
      });
      setPageInfo({ ...pageInfo, rows: updatedRows });
    } catch (error) {
      console.error('Error setting priorities:', error);
      notifications.error('Failed to set students as priority');
    }
  };

  const addStudent = () => {
    setShowAddStudent(true);
  };

  const handleCloseStudentModal = () => {
    setShowAddStudent(false);
  };

  async function handleSubmit(studentIds: string[]) {
    planService
      .addStudents(plan, studentIds)
      .then(() => {
        notifications.success("Students added.");
        setRefresh(refresh + 1);
        setShowAddStudent(false);
      })
      .catch((err) => {
        notifications.error("Error adding students.");
        console.error(err);
      });
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
      setRowSelectionModel([]);
      setRefresh(refresh + 1); // Only refresh after successful deletion
    });
    setOpenDeleteDialog(false);
  };

  const toggleAnchor = async (placement: Placement) => {
    // Optimistic update
    const updatedRows = pageInfo.rows.map((row: Placement) => {
      if (row.id === placement.id) {
        return { ...row, anchor: !placement.anchor };
      }
      return row;
    });
    setPageInfo({ ...pageInfo, rows: updatedRows });

    try {
      await placementService.updatePlacement(
        placement.plan_id,
        placement.student_id,
        { anchor: !placement.anchor }
      );
      notifications.success(`Student ${placement.anchor ? 'removed from' : 'set as'} anchor`);
    } catch (error) {
      console.error('Error toggling anchor:', error);
      notifications.error('Failed to update student anchor status');
      // Revert optimistic update
      setPageInfo({ ...pageInfo });
    }
  };

  const togglePriority = async (placement: Placement) => {
    const newPriority = placement.priority === 0 ? 1 : 0;
    
    // Optimistic update
    const updatedRows = pageInfo.rows.map((row: Placement) => {
      if (row.id === placement.id) {
        return { ...row, priority: newPriority };
      }
      return row;
    });
    setPageInfo({ ...pageInfo, rows: updatedRows });

    try {
      await placementService.updatePlacement(
        placement.plan_id,
        placement.student_id,
        { priority: newPriority }
      );
      notifications.success(`Student ${newPriority === 1 ? 'set as' : 'removed from'} priority`);
    } catch (error) {
      console.error('Error toggling priority:', error);
      notifications.error('Failed to update student priority status');
      // Revert optimistic update
      setPageInfo({ ...pageInfo });
    }
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
        valueGetter: (params) => `${params.row.student.name}`,
      },
      {
        field: "email",
        headerName: "Email",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.email}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.email}`,
      },
      {
        field: "city",
        headerName: "City",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.city}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.city}`,
      },
      {
        field: "country",
        headerName: "Country",
        width: 140,
        renderCell: (param: GridRenderCellParams) => {
          return <Typography>{param.row.student.country}</Typography>;
        },
        valueGetter: (params) => `${params.row.student.country}`,
      },
      {
        field: "availability",
        headerName: "Availability",
        width: 140,
        sortable: false,
        filterable: false
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
          columns={columns}
          paginationModel={paginationModel}
          rowCount={pageInfo.totalRowCount}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
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
      />
    </Box>
  );
};
