/**
 *  DetailsTable.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';

import { Button } from '@mui/material';
import {
  DataGrid,
  getGridStringOperators,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';

import { DeleteOutlined } from '@ant-design/icons';
import { LoadingContext, RefreshContext, useNotifications } from '@digitalaidseattle/core';
import { ConfirmationDialog } from '@digitalaidseattle/mui';
import { PageInfo, QueryModel } from '@digitalaidseattle/supabase';
import { CEFacilitatorService } from '../../api/ceFacilitatorService';
import { CEProfile, Facilitator } from '../../api/types';
import DisplayTimeWindow from '../../components/DisplayTimeWindow';
import FacilitatorModal from './FacilitatorModal';
import { TimeSlots } from '../../components/TimeSlots';
import { DEFAULT_TABLE_PAGE_SIZE, UI_STRINGS } from '../../constants';
import { CETimeWindowService } from '../../api/ceTimeWindowService';

const DetailsTable: React.FC = () => {
  const facilitatorService = CEFacilitatorService.getInstance();
  const timeWindowService = CETimeWindowService.getInstance();

  const { setLoading } = useContext(LoadingContext);
  const { refresh, setRefresh } = useContext(RefreshContext);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [pageInfo, setPageInfo] = useState<PageInfo<Facilitator>>({ rows: [], totalRowCount: 0 });
  const notifications = useNotifications();

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<CEProfile | null>(null);

  const [deleteProfile, setDeleteProfile] = useState<CEProfile | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string>(UI_STRINGS.ARE_YOU_SURE_DELETE_STUDENT);
  const [deleteConfirmation, showDeleteConfirmation] = useState<boolean>(false);

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
      facilitatorService
        .find(queryModel)
        .then((pi) => setPageInfo(pi))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [paginationModel, sortModel, filterModel, refresh]);

  function handleSelectDeleteProfile(param: GridRenderCellParams) {
    return (evt: any) => {
      setDeleteProfile(param.row);
      setDeleteMessage(`${UI_STRINGS.CONFIRM_DELETE_STUDENT_PREFIX} ${param.row.name}?`);
      showDeleteConfirmation(true);
      evt.stopPropagation()
    }
  }

  function doDeleteStudent() {
    if (deleteProfile) {
      facilitatorService.delete(deleteProfile.id!)
        .then(() => {
          notifications.success(`${UI_STRINGS.DELETION_SUCCESS_PREFIX} ${deleteProfile.name} ${UI_STRINGS.DELETION_SUCCESS_SUFFIX}`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
          notifications.error(`${UI_STRINGS.DELETION_FAILED_PREFIX} ${err.message}`);
        })
        .finally(() => {
          setSelectedProfile(null);
          showDeleteConfirmation(false);
        })
    }
  }

  function doUpdate(facilitator: Facilitator) {
    if (facilitator) {
      timeWindowService.adjustTimeWindows(facilitator);
      facilitatorService.save(facilitator)
        .then(() => {
          notifications.success(`Profile ${facilitator.name} updated successfully`);
          setRefresh(refresh + 1);
        })
        .catch((err) => {
          console.error(`Update failed: ${err.message}`);
          notifications.error(`Update failed: ${err.message}`);
        })
        .finally(() => {
          setSelectedProfile(null);
          setShowDetails(false);
        })
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '',
      width: 75,
      renderCell: (param: GridRenderCellParams) => {
        return (
          <Button
            color='error'
            onClick={handleSelectDeleteProfile(param)} >
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
        .filter((operator) => facilitatorService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'email',
      headerName: UI_STRINGS.EMAIL,
      width: 200,
      filterOperators: getGridStringOperators()
        .filter((operator) => facilitatorService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'time_zone',
      headerName: UI_STRINGS.TIME_ZONE,
      width: 150,
      filterOperators: getGridStringOperators()
        .filter((operator) => facilitatorService.supportedStringFilters().includes(operator.value))
    },
    {
      field: 'preferences',
      headerName: UI_STRINGS.TIME_SLOTS_LABEL,
      width: 200,
      renderCell: (params) => <TimeSlots timeWindows={params.row.timeWindows ?? []} />,
      filterable: false,
      sortable: false,
    },
    {
      field: 'timeWindows',
      headerName: UI_STRINGS.AVAILABILITIES,
      flex: 1,
      renderCell: (params) => {
        const timeWindows = Array.isArray(params.value) ? params.value : [];
        return <DisplayTimeWindow timeWindows={timeWindows} timezone={params.row.time_zone} />
      },
      filterable: false,
      sortable: false,
    }
  ];

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
          setSelectedProfile(row.row);
          setShowDetails(true);
        }}
      />
      {selectedProfile && (
        <FacilitatorModal
          mode={'edit'}
          facilitator={selectedProfile}
          open={showDetails}
          onClose={() => {
            setSelectedProfile(null);
            setShowDetails(false);
          }}
          onChange={doUpdate} />
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

export default DetailsTable;
