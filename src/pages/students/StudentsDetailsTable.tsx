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
import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { studentService } from '../../api/ceStudentService';
import { Student } from '../../api/types';
import DisplayTimeWindow from '../../components/DisplayTimeWindow';
import StudentModal from './StudentModal';

const PAGE_SIZE = 10;


const StudentsDetailsTable: React.FC = () => {
  const { setLoading } = useContext(LoadingContext);
  const { refresh, setRefresh } = useContext(RefreshContext);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Student>>({ rows: [], totalRowCount: 0 });
  const notifications = useNotifications();

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string>('Are you sure you want to delete this student?');
  const [deleteConfirmation, showDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    setColumns(getColumns());
  }, []);

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
        .find(queryModel, '*, timewindow(*)')
        .then((pi) => setPageInfo(pi))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [refresh, paginationModel, sortModel, filterModel]);

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
      console.error('Error toggling anchor:', error);
      notifications.error('Failed to update student anchor status');
      // Revert optimistic update
      setPageInfo({ ...pageInfo });
    }
  };

  function handleDeleteStudent(param: GridRenderCellParams) {
    return (evt: any) => {
      console.log('handleDeleteStudent', param.row.id, param.row.name);

      studentService.getCohortsForStudent(param.row)
        .then((cohorts) => {
          if (cohorts.length > 0) {
            notifications.error(`Cannot delete student ${param.row.name} as they are enrolled in cohorts.`);
            return;
          } else {
            setDeleteStudent(param.row);
            setDeleteMessage(`Are you sure you want to delete student ${param.row.name}?`);
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
          notifications.success(`Student ${deleteStudent.name} deleted successfully`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`Deletion failed: ${err.message}`);
          notifications.error(`Deletion failed: ${err.message}`);
        })
        .finally(() => {
          setSelectedStudent(null);
          showDeleteConfirmation(false);
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
        headerName: 'Name',
        width: 150,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))

      },
      {
        field: 'country',
        headerName: 'Country',
        width: 150,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
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
        field: 'age',
        headerName: 'Age',
        width: 75,
        type: 'number',
        filterOperators: getGridNumericOperators()
          .filter((operator) => studentService.supportedNumberFilters().includes(operator.value))
      },
      {
        field: 'gender',
        headerName: 'Gender',
        width: 100,
        filterOperators: getGridStringOperators()
          .filter((operator) => studentService.supportedStringFilters().includes(operator.value))
      },
      {
        field: 'timeWindows',
        headerName: 'Availabilities',
        width: 150,
        renderCell: (params) => {
          const timeWindows = Array.isArray(params.value) ? params.value : [];
          return <DisplayTimeWindow timeWindows={timeWindows} />
        },
        filterable: false
      }
    ];
  };

  return (
    <>
      <DataGrid
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
          onClose={() => setShowDetails(false)}
          handleSubmit={function (event: any): void {
            console.log('edit', event)
          }} />
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
