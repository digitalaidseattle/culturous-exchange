/**
 *  StudentsDetailsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

import { Button } from '@mui/material';
import {
  DataGrid,
  getGridNumericOperators,
  getGridStringOperators,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';

import { DeleteOutlined, StarFilled } from '@ant-design/icons';
import { LoadingContext, RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { ConfirmationDialog } from '@digitalaidseattle/mui';
import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { studentService } from '../../api/ceStudentService';
import { UI_STRINGS, SERVICE_ERRORS } from '../../constants';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../constants';
import { timeWindowService } from '../../api/ceTimeWindowService';
import { Student } from '../../api/types';
import DisplayTimeWindow from '../../components/DisplayTimeWindow';
import StudentModal from '../../components/StudentModal';
import { TimeSlots } from '../../components/TimeSlots';


const StudentsDetailsTable: React.FC = () => {
  const { setLoading } = useContext(LoadingContext);
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [initialize, setInitialize] = useState<boolean>(true);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });
  const notifications = useNotifications();

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string>(UI_STRINGS.ARE_YOU_SURE_DELETE_STUDENT);
  const [deleteConfirmation, showDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    if (initialize) {
      setColumns(getColumns());
      setInitialize(false);
    }
  }, [initialize]);

  useEffect(() => {
    if (paginationModel && sortModel && filterModel) {
      // Only one filter field is supported at a time in Free MUI distribution
      setLoading(true);
      const queryModel = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortField: sortModel.length === 0 ? 'name' : sortModel[0].field,
        sortDirection: sortModel.length === 0 ? 'asc' : sortModel[0].sort,
        filterField: filterModel.items.length > 0 ? filterModel.items[0].field : undefined,
        filterOperator: filterModel.items.length > 0 ? filterModel.items[0].operator : undefined,
        filterValue: filterModel.items.length > 0 ? filterModel.items[0].value : undefined,
      } as QueryModel;
      studentService
        .find(queryModel)
        .then((pi) => setPageInfo(pi))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [paginationModel, sortModel, filterModel]);

  const toggleAnchor = async (student: Student) => {
    try {
      student.anchor = !student.anchor;
      studentService
        .update(student.id, { anchor: student.anchor })
        .then((resp) => {
          console.log('Anchor status updated:', resp);
          setRefresh(refresh + 1);
        });
    } catch (error) {
      console.error(SERVICE_ERRORS.ERROR_TOGGLING_ANCHOR, error);
      notifications.error(UI_STRINGS.FAILED_UPDATE_ANCHOR);
      // Revert optimistic update
      setPageInfo({ ...pageInfo });
    }
  };

  function handleDeleteStudent(param: GridRenderCellParams) {
    return (evt: any) => {
      studentService.getCohortsForStudent(param.row)
        .then((cohorts) => {
          if (cohorts.length > 0) {
            notifications.error(`${UI_STRINGS.CANNOT_DELETE_STUDENT_PREFIX} ${param.row.name} ${UI_STRINGS.CANNOT_DELETE_STUDENT_SUFFIX}`);
            return;
          } else {
            setDeleteStudent(param.row);
            setDeleteMessage(`${UI_STRINGS.CONFIRM_DELETE_STUDENT_PREFIX} ${param.row.name}?`);
            showDeleteConfirmation(true);
          }
          evt.stopPropagation()
        })
    }
  }

  function doDeleteStudent() {
    if (deleteStudent) {
      studentService.delete(deleteStudent.id)
        .then(() => {
          notifications.success(`${UI_STRINGS.DELETION_SUCCESS_PREFIX} ${deleteStudent.name} ${UI_STRINGS.DELETION_SUCCESS_SUFFIX}`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
          notifications.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
        })
        .finally(() => {
          setSelectedStudent(null);
          showDeleteConfirmation(false);
        })
    }
  }

  function doUpdateStudent(student: Student) {
    if (student) {
      timeWindowService.adjustTimeWindows(student);
      studentService.save(student)
        .then(() => {
          notifications.success(`Student ${student.name} updated successfully`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`Update failed: ${err.message}`);
          notifications.error(`Update failed: ${err.message}`);
        })
        .finally(() => {
          setSelectedStudent(null);
          setShowDetails(false);
        })
    }
  }

  const getColumns = (): GridColDef[] => {
    return [
      {
        field: 'id',
        headerName: '',
        width: 75,
        renderCell: (param: GridRenderCellParams) => {
          return (
            <Button
              color='error'
              onClick={handleDeleteStudent(param)} >
              <DeleteOutlined />
            </Button>
          );
        }
      },
      {
        field: 'name',
        headerName: UI_STRINGS.NAME,
        width: 150,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
      },
      {
        field: 'email',
        headerName: UI_STRINGS.EMAIL,
        width: 200,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))

      },
      {
        field: 'country',
        headerName: UI_STRINGS.COUNTRY,
        width: 100,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
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
        field: 'age',
        headerName: UI_STRINGS.AGE,
        width: 75,
        type: 'number',
        filterOperators: getGridNumericOperators()
          .filter((operator) => studentService.supportedNumberFilters().includes(operator.value))
      },
      {
        field: 'gender',
        headerName: UI_STRINGS.GENDER,
        width: 100,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
      },
      {
        field: 'time_zone',
        headerName: UI_STRINGS.TIME_ZONE,
        width: 150,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
      },
      {
        field: 'preferences',
        headerName: UI_STRINGS.TIME_SLOTS_LABEL,
        width: 200,
        renderCell: (params) => {
          return <TimeSlots timeWindows={params.row.timeWindows} />
        },
        filterable: false
      },
      {
        field: 'timeWindows',
        headerName: UI_STRINGS.AVAILABILITIES,
        width: 650,
        renderCell: (params) => {
          const timeWindows = Array.isArray(params.value) ? params.value : [];
          return <DisplayTimeWindow timeWindows={timeWindows} timezone={params.row.time_zone} />
        },
        filterable: false
      }
    ];
  };

  return (columns &&
    <>
      <DataGrid
        sx={{ width: '100%' }}
        rows={pageInfo.rows}
        columns={columns}
        rowCount={pageInfo.totalRowCount}
        pageSizeOptions={[5, 10, 25, 100]}

        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}

        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}

        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}

        onRowDoubleClick={(row) => {
          setSelectedStudent(row.row);
          setShowDetails(true);
        }}
      />
      {selectedStudent && (
        <StudentModal
          mode={'edit'}
          student={selectedStudent}
          open={showDetails}
          onClose={() => {
            setSelectedStudent(null);
            setShowDetails(false);
          }}
          onChange={doUpdateStudent} />
      )}
      <ConfirmationDialog
        message={deleteMessage}
        open={deleteConfirmation}
        handleConfirm={function (): void {
          doDeleteStudent();
        }}
        handleCancel={function (): void {
          showDeleteConfirmation(false);
        }} />
    </>
  );
};

export default StudentsDetailsTable;
