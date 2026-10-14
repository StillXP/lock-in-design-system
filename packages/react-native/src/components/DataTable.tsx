import { useMemo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { Icon } from './Icon';

export type SortDirection = 'ascending' | 'descending';
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  /** Column width in the 'scroll' layout (dp). */
  width?: number;
  isRowHeader?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T, index: number) => string;
  caption: string;
  hideCaption?: boolean;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  manualSorting?: boolean;
  density?: 'compact' | 'default' | 'comfortable';
  striped?: boolean;
  /** stack (default on native): each row is a card of label/value pairs. scroll: horizontal grid. */
  mobileLayout?: 'scroll' | 'stack';
  loading?: boolean;
  emptyState?: ReactNode;
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
  density = 'default',
  striped = false,
  mobileLayout = 'stack',
  loading = false,
  emptyState = 'No results',
}: DataTableProps<T>) {
  const { t } = useTheme();
  const [sortState, setSortState] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const padY = density === 'compact' ? t.space.xs : density === 'comfortable' ? t.space.md : t.space.sm;
  const raw = (row: T, key: string) => (row as Record<string, unknown>)[key];

  const sorted = useMemo(() => {
    if (!sortState || manualSorting) return rows;
    const col = columns.find((c) => c.key === sortState.key);
    if (!col) return rows;
    const v = (r: T) => (col.sortValue ? col.sortValue(r) : raw(r, col.key));
    const dir = sortState.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => compare(v(a), v(b)) * dir);
  }, [rows, columns, sortState, manualSorting]);

  const toggleSort = (key: string) =>
    setSortState(
      sortState?.key === key && sortState.direction === 'ascending' ? { key, direction: 'descending' } : { key, direction: 'ascending' },
    );

  const renderCell = (row: T, col: DataTableColumn<T>) => {
    const content = col.cell ? col.cell(row) : (raw(row, col.key) as ReactNode);
    return typeof content === 'string' || typeof content === 'number' ? (
      <Text style={[textStyle(t.typography.body.sm), { color: t.color.text.primary, fontWeight: col.isRowHeader ? '500' : '400', textAlign: col.align === 'end' ? 'right' : col.align === 'center' ? 'center' : 'left' }]}>
        {content}
      </Text>
    ) : (
      content
    );
  };

  /** Plain-text summary so a screen reader reads a whole row in one swipe. */
  const rowLabel = (row: T) =>
    columns
      .map((c) => {
        const v = c.sortValue ? c.sortValue(row) : raw(row, c.key);
        return typeof v === 'string' || typeof v === 'number' ? `${c.header}: ${v}` : null;
      })
      .filter(Boolean)
      .join(', ');

  const sortable = columns.filter((c) => c.sortable);
  const headerText = [textStyle(t.typography.label.md), { color: t.color.text.secondary }];

  const sortControls = sortable.length > 0 && (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.space.xs, paddingBottom: t.space.sm }}>
      {sortable.map((c) => {
        const active = sortState?.key === c.key;
        return (
          <Pressable
            key={c.key}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${c.header}`}
            accessibilityValue={{ text: active ? sortState!.direction : 'not sorted' }}
            onPress={() => toggleSort(c.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space['2xs'],
              minHeight: 36,
              paddingHorizontal: t.space.sm,
              borderRadius: t.radius.full,
              borderWidth: t.border.width.thin,
              borderColor: active ? t.color.border.selected : t.color.border.default,
              backgroundColor: active ? t.color.surface.selected : 'transparent',
            }}
            hitSlop={4}
          >
            <Text style={headerText}>{c.header}</Text>
            <Icon size="sm" name={active ? (sortState!.direction === 'ascending' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down'} color={active ? 'brand' : 'secondary'} />
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const status = loading ? (
    <View style={{ padding: t.space.xl, alignItems: 'center' }} accessibilityLiveRegion="polite">
      <ActivityIndicator color={t.color.icon.secondary} accessibilityLabel="Loading" />
    </View>
  ) : sorted.length === 0 ? (
    <View style={{ padding: t.space.xl, alignItems: 'center' }}>
      {typeof emptyState === 'string' ? <Text style={[textStyle(t.typography.body.md), { color: t.color.text.secondary }]}>{emptyState}</Text> : emptyState}
    </View>
  ) : null;

  const container = {
    borderWidth: t.border.width.thin,
    borderColor: t.color.border.default,
    borderRadius: t.radius.lg,
    backgroundColor: t.color.surface.default,
    overflow: 'hidden' as const,
  };

  return (
    <View style={{ gap: t.space.xs }}>
      {!hideCaption && (
        <Text accessibilityRole="header" style={[textStyle(t.typography.heading.xs), { color: t.color.text.primary }]}>
          {caption}
        </Text>
      )}
      {mobileLayout === 'stack' ? (
        <>
          {sortControls}
          <View style={container} accessibilityLabel={hideCaption ? caption : undefined}>
            {status ??
              sorted.map((row, i) => (
                <View
                  key={getRowId(row, i)}
                  accessible
                  accessibilityLabel={rowLabel(row)}
                  style={{
                    paddingVertical: padY,
                    paddingHorizontal: t.space.md,
                    gap: t.space['2xs'],
                    borderTopWidth: i === 0 ? 0 : t.border.width.thin,
                    borderTopColor: t.color.border.subtle,
                    backgroundColor: striped && i % 2 ? t.color.background.subtle : 'transparent',
                  }}
                >
                  {columns.map((col) => (
                    <View key={col.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: t.space.md }}>
                      <Text style={headerText}>{col.header}</Text>
                      <View style={{ flexShrink: 1, alignItems: 'flex-end' }}>{renderCell(row, col)}</View>
                    </View>
                  ))}
                </View>
              ))}
          </View>
        </>
      ) : (
        <ScrollView horizontal style={container}>
          <View>
            <View accessibilityRole="header" style={{ flexDirection: 'row', backgroundColor: t.color.background.subtle }}>
              {columns.map((col) => (
                <Pressable
                  key={col.key}
                  disabled={!col.sortable}
                  accessibilityRole={col.sortable ? 'button' : undefined}
                  accessibilityLabel={col.sortable ? `Sort by ${col.header}` : col.header}
                  onPress={() => toggleSort(col.key)}
                  style={{ width: col.width ?? 120, flexDirection: 'row', alignItems: 'center', gap: t.space['2xs'], paddingVertical: padY, paddingHorizontal: t.space.md }}
                >
                  <Text style={headerText}>{col.header}</Text>
                  {col.sortable && (
                    <Icon size="sm" name={sortState?.key === col.key ? (sortState.direction === 'ascending' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down'} color="secondary" />
                  )}
                </Pressable>
              ))}
            </View>
            {status ??
              sorted.map((row, i) => (
                <View
                  key={getRowId(row, i)}
                  accessible
                  accessibilityLabel={rowLabel(row)}
                  style={{ flexDirection: 'row', borderTopWidth: t.border.width.thin, borderTopColor: t.color.border.subtle, backgroundColor: striped && i % 2 ? t.color.background.subtle : 'transparent' }}
                >
                  {columns.map((col) => (
                    <View key={col.key} style={{ width: col.width ?? 120, paddingVertical: padY, paddingHorizontal: t.space.md, justifyContent: 'center' }}>
                      {renderCell(row, col)}
                    </View>
                  ))}
                </View>
              ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
