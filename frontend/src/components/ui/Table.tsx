import type { Key, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type TableDensity = 'compact' | 'comfortable';
type TableAlign = 'left' | 'center' | 'right';

export interface TableColumn<T extends object> {
  key: string;
  header: ReactNode;
  accessor: keyof T | ((row: T) => ReactNode);
  align?: TableAlign;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T extends object> {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: keyof T | ((row: T) => Key);
  density?: TableDensity;
  loading?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  hideCaption?: boolean;
  className?: string;
}

const densityClasses: Record<TableDensity, string> = {
  compact: 'px-3 py-2 text-sm',
  comfortable: 'px-4 py-3 text-sm',
};

const alignClasses: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function getCellValue<T extends object>(row: T, column: TableColumn<T>) {
  if (typeof column.accessor === 'function') {
    return column.accessor(row);
  }

  return row[column.accessor] as ReactNode;
}

function getRowKey<T extends object>(row: T, rowKey: keyof T | ((row: T) => Key)) {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }

  return String(row[rowKey]);
}

export function Table<T extends object>({
  caption,
  columns,
  rows,
  rowKey,
  density = 'comfortable',
  loading = false,
  emptyMessage = 'No records found.',
  errorMessage,
  hideCaption = false,
  className,
}: TableProps<T>) {
  const bodyColSpan = columns.length;

  return (
    <div
      className={cn('overflow-x-auto rounded-card border border-line bg-canvas', className)}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="min-w-full border-collapse">
        <caption className={hideCaption ? 'sr-only' : 'px-4 py-3 text-left text-sm font-semibold text-ink-soft'}>
          {caption}
        </caption>
        <thead className="bg-canvas-warm text-xs uppercase tracking-[0.12em] text-ink-muted">
          <tr>
            {columns.map((column) => (
              <th
                className={cn(densityClasses[density], alignClasses[column.align ?? 'left'], column.className)}
                key={column.key}
                scope="col"
                aria-sort={column.sortable ? 'none' : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {column.header}
                  {column.sortable ? <span aria-hidden="true">v</span> : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading ? (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-ink-muted" colSpan={bodyColSpan}>
                Loading table data...
              </td>
            </tr>
          ) : null}

          {!loading && errorMessage ? (
            <tr>
              <td className="px-4 py-8 text-center text-sm font-semibold text-danger" colSpan={bodyColSpan}>
                {errorMessage}
              </td>
            </tr>
          ) : null}

          {!loading && !errorMessage && rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-ink-muted" colSpan={bodyColSpan}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}

          {!loading && !errorMessage
            ? rows.map((row) => (
                <tr className="transition hover:bg-canvas-soft" key={getRowKey(row, rowKey)}>
                  {columns.map((column) => (
                    <td
                      className={cn(
                        'text-ink-soft',
                        densityClasses[density],
                        alignClasses[column.align ?? 'left'],
                        column.className,
                      )}
                      key={column.key}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
