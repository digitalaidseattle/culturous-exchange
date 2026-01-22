/**
 *  StudentsDetailsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

import { Button, Stack, Toolbar } from '@mui/material';
import {
  DataGrid,
  getGridStringOperators,
  GridFilterModel,
  GridRenderCellParams,
  GridRowParams,
  GridSortModel
} from '@mui/x-data-grid';

import { DeleteOutlined } from '@ant-design/icons';
import { LoadingContext, RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { ConfirmationDialog } from '@digitalaidseattle/mui';
import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { MockFilitatorService } from '../../api/ceFacilitatorService';
import { Facilitator } from '../../api/types';
import DisplayTimeWindow from '../../components/DisplayTimeWindow';
import FacilitatorModal from '../../components/FacilitatorModal';
import { TimeSlots } from '../../components/TimeSlots';
import { TimeToggle } from '../../components/TimeToggle';
import { DEFAULT_TABLE_PAGE_SIZE, UI_STRINGS } from '../../constants';

// const service = CEFacilitatorService.getInstance();
const service = new MockFilitatorService();
const FacilitatorsDetailsTable: React.FC = () => {
  const { setLoading } = useContext(LoadingContext);
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [initialize, setInitialize] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Facilitator>>({ rows: [], totalRowCount: 0 });
  const notifications = useNotifications();

  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedFacilitator, setSelectedFacilitator] = useState<Facilitator | null>(null);

  const [deleteFacilitator, setDeleteFacilitator] = useState<Facilitator | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string>(UI_STRINGS.ARE_YOU_SURE_DELETE_STUDENT);
  const [deleteConfirmation, showDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    if (initialize) {
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
      service
        .find(queryModel)
        .then((pi) => setPageInfo(pi))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [paginationModel, sortModel, filterModel]);

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 75,
      renderCell: (param: GridRenderCellParams) => {
        return (
          <Button
            color='error'
            onClick={handleDeleteFacilitator(param)} >
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
        .filter((operator) => service.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'email',
      headerName: UI_STRINGS.EMAIL,
      width: 200,
      filterOperators: getGridStringOperators()
        .filter((operator) => service.supportedStringFilters().includes(operator.value))

    },
    {
      field: 'country',
      headerName: UI_STRINGS.COUNTRY,
      width: 100,
      filterOperators: getGridStringOperators()
        .filter((operator) => service.supportedStringFilters().includes(operator.value))
    },

    {
      field: 'time_zone',
      headerName: UI_STRINGS.TIME_ZONE,
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => service.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'preferences',
      headerName: UI_STRINGS.TIME_SLOTS_LABEL,
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        return <TimeSlots timeWindows={params.row.timeWindows} />
      },
      filterable: false
    },
    {
      field: 'timeWindows',
      headerName: UI_STRINGS.AVAILABILITIES,
      width: 450,
      renderCell: (params: GridRenderCellParams) => {
        const timeWindows = Array.isArray(params.value) ? params.value : [];
        return <DisplayTimeWindow timeWindows={timeWindows} timezone={params.row.time_zone} />
      },
      filterable: false
    }
  ];

  function customToolbar() {
    return (
      <Toolbar sx={{ backgroundColor: 'background.default' }}>
        <Stack direction={'row'} sx={{ gap: 1, flexGrow: 1 }}>
          <Button
            title='Upload Facilitator'
            variant="contained"
            color="primary"
            onClick={() => alert('todo show a dropzone dialog')}
          >
            {UI_STRINGS.UPLOAD}
          </Button>
          <Button
            title='Add Facilitator'
            variant="contained"
            color="primary"
            onClick={() => {
              setEditMode('add');
              setSelectedFacilitator(service.empty());
              setShowDetails(true);
            }}
          >
            {UI_STRINGS.ADD}
          </Button>
        </Stack>
        <TimeToggle userTitle={UI_STRINGS.FACILITATOR_TIME} />
      </Toolbar>
    );
  }

  function handleDoubleClick(params: GridRowParams): void {
    console.log(params);
    setEditMode('edit');
    setSelectedFacilitator(params.row);
    setShowDetails(true);
  }

  function handleDeleteFacilitator(param: GridRenderCellParams) {
    // FIXME
    return (evt: any) => {
      service.getCohorts(param.row)
        .then((cohorts) => {
          if (cohorts.length > 0) {
            notifications.error(`${UI_STRINGS.CANNOT_DELETE_STUDENT_PREFIX} ${param.row.name} ${UI_STRINGS.CANNOT_DELETE_STUDENT_SUFFIX}`);
            return;
          } else {
            setDeleteFacilitator(param.row);
            setDeleteMessage(`${UI_STRINGS.CONFIRM_DELETE_STUDENT_PREFIX} ${param.row.name}?`);
            showDeleteConfirmation(true);
          }
          evt.stopPropagation()
        })
    }
  }

  function doDeleteFacilitator() {
    // FIXME
    if (deleteFacilitator) {
      service.delete(deleteFacilitator.id)
        .then(() => {
          notifications.success(`${UI_STRINGS.DELETION_SUCCESS_PREFIX} ${deleteFacilitator.name} ${UI_STRINGS.DELETION_SUCCESS_SUFFIX}`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
          notifications.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
        })
        .finally(() => {
          setSelectedFacilitator(null);
          showDeleteConfirmation(false);
        })
    }
  }

  function doUpdateFacilitator(facilitator: Facilitator) {
    if (facilitator) {
      // FIXME
      // timeWindowService.adjustTimeWindows(facilitator);
      service.save(facilitator)
        .then(() => {
          notifications.success(`Facilitator ${facilitator.name} updated successfully`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`Update failed: ${err.message}`);
          notifications.error(`Update failed: ${err.message}`);
        })
        .finally(() => {
          setSelectedFacilitator(null);
          setShowDetails(false);
        })
    }
  }


  return (columns &&
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

        onRowDoubleClick={handleDoubleClick}

        showToolbar={true}
        slots={{
          toolbar: customToolbar
        }}
      />
      {selectedFacilitator && (
        <FacilitatorModal
          mode={editMode}
          facilitator={selectedFacilitator}
          open={showDetails}
          onClose={() => {
            setSelectedFacilitator(null);
            setShowDetails(false);
          }}
          onChange={doUpdateFacilitator} />
      )}

      <ConfirmationDialog
        message={deleteMessage}
        open={deleteConfirmation}
        handleConfirm={function (): void {
          doDeleteFacilitator();
        }}
        handleCancel={function (): void {
          showDeleteConfirmation(false);
        }} />
    </>
  );
};

export default FacilitatorsDetailsTable;
