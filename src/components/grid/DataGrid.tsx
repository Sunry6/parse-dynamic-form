import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface DataGridProps<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  onGridReady?: (event: GridReadyEvent) => void;
  className?: string;
}

export function DataGrid<T>({
  rowData,
  columnDefs,
  onGridReady,
  className = 'h-[500px]',
}: DataGridProps<T>) {
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      event.api.sizeColumnsToFit();
      onGridReady?.(event);
    },
    [onGridReady]
  );

  return (
    <div className={`ag-theme-alpine ${className}`}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={handleGridReady}
        animateRows={true}
        pagination={true}
        paginationPageSize={20}
      />
    </div>
  );
}
