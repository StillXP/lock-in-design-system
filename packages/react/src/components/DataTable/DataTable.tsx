import { useId, useMemo, useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import { VisuallyHidden } from '../../utils/VisuallyHidden';
import { Checkbox } from '../Checkbox/Checkbox';
import { Icon } from '../Icon/Icon';

export type SortDirection = 'ascending' | 'descending';
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  /** Plain-text header. Also used as the label in stacked mobile layout. */
  header: string;
  /** Cell renderer. Defaults to row[key]. */
  cell?: (row: T) => ReactNode;
  /** Value used for sorting. Defaults to row[key]. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  /** Use 'end' for numbers so digits line up. */
  align?: 'start' | 'center' | 'end';
  width?: string;
  /** Marks the cell as the row header (<th scope="row">) — usually the name column. */
  isRowHeader?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T, index: number) => string;
  /** Describes the table for screen readers. Required; hide visually with hideCaption. */
  caption: string;
  hideCaption?: boolean;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Disable internal sorting (e.g. when the server sorts). */
  manualSorting?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Accessible label for a row's checkbox. Defaults to the row id. */
  getRowLabel?: (row: T) => string;
  density?: 'compact' | 'default' | 'comfortable';
  striped?: boolean;
  stickyHeader?: boolean;
  /** scroll: horizontal scroll on small screens. stack: rows become cards below 640px. */
  mobileLayout?: 'scroll' | 'stack';
  loading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

const compare = (a: unknown, b: unknown) => {
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  hideCaption = false,
  sort,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  getRowLabel,
  density = 'default',
  striped = false,
  stickyHeader = false,
  mobileLayout = 'scroll',
  loading = false,
  emptyState = 'No results',
  className,
}: DataTableProps<T>) {
  const id = useId();
  const [sortState, setSortState] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const [selected, setSelected] = useControllableState(selectedIds, defaultSelectedIds, onSelectionChange);
  const [announcement, setAnnouncement] = useState('');

  const getRaw = (row: T, key: string) => (row as Record<string, unknown>)[key];

  const sortedRows = useMemo(() => {
    if (!sortState || manualSorting) return rows;
    const col = columns.find((c) => c.key === sortState.key);
    if (!col) return rows;
    const value = (r: T) => (col.sortValue ? col.sortValue(r) : getRaw(r, col.key));
    const dir = sortState.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => compare(value(a), value(b)) * dir);
  }, [rows, columns, sortState, manualSorting]);

  const toggleSort = (col: DataTableColumn<T>) => {
    const next: SortState =
      sortState?.key === col.key && sortState.direction === 'ascending'
        ? { key: col.key, direction: 'descending' }
        : { key: col.key, direction: 'ascending' };
    setSortState(next);
    setAnnouncement(`Sorted by ${col.header}, ${next.direction}`);
  };

  const allIds = sortedRows.map(getRowId);
  const selectedSet = new Set(selected);
  const allSelected = allIds.length > 0 && allIds.every((rid) => selectedSet.has(rid));
  const someSelected = !allSelected && allIds.some((rid) => selectedSet.has(rid));

  const toggleRow = (rid: string) =>
    setSelected(selectedSet.has(rid) ? selected.filter((s) => s !== rid) : [...selected, rid]);
  const toggleAll = () => setSelected(allSelected ? [] : allIds);

  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className={cx('ds-table-wrap', className)}>
      <div
        className={cx('ds-table-scroll', 'ds-focus-ring', stickyHeader && 'ds-table-scroll--sticky')}
        role="region"
        aria-labelledby={`${id}-caption`}
        tabIndex={0}
      >
        <table
          className={cx(
            'ds-table',
            `ds-table--${density}`,
            striped && 'ds-table--striped',
            mobileLayout === 'stack' && 'ds-table--stack',
          )}
          aria-busy={loading || undefined}
        >
          <caption id={`${id}-caption`} className={cx('ds-table__caption', hideCaption && 'ds-visually-hidden')}>
            {caption}
          </caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="ds-table__select">
                  <Checkbox
                    label="Select all rows"
                    hideLabel
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = sortState?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width, textAlign: col.align === 'end' ? 'right' : col.align === 'center' ? 'center' : undefined }}
                    aria-sort={col.sortable ? (active ? sortState!.direction : 'none') : undefined}
                  >
                    {col.sortable ? (
                      <button type="button" className="ds-table__sort ds-focus-ring" onClick={() => toggleSort(col)}>
                        {col.header}
                        <Icon
                          size="sm"
                          name={active ? (sortState!.direction === 'ascending' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down'}
                          className={cx('ds-table__sort-icon', active && 'is-active')}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={colCount} className="ds-table__status">
                  <span className="ds-spinner" aria-hidden="true" /> Loading…
                </td>
              </tr>
            )}
            {!loading && sortedRows.length === 0 && (
              <tr>
                <td colSpan={colCount} className="ds-table__status">{emptyState}</td>
              </tr>
            )}
            {!loading &&
              sortedRows.map((row, index) => {
                const rid = getRowId(row, index);
                const isSelected = selectedSet.has(rid);
                return (
                  <tr key={rid} aria-selected={selectable ? isSelected : undefined} className={cx(isSelected && 'is-selected')}>
                    {selectable && (
                      <td className="ds-table__select">
                        <Checkbox
                          label={`Select ${getRowLabel ? getRowLabel(row) : rid}`}
                          hideLabel
                          checked={isSelected}
                          onChange={() => toggleRow(rid)}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const content = col.cell ? col.cell(row) : (getRaw(row, col.key) as ReactNode);
                      const Cell = col.isRowHeader ? 'th' : 'td';
                      return (
                        <Cell
                          key={col.key}
                          scope={col.isRowHeader ? 'row' : undefined}
                          data-label={col.header}
                          className={cx(col.align && `ds-table__cell--${col.align}`)}
                        >
                          {content}
                        </Cell>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>
    </div>
  );
}
