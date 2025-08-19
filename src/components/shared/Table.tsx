import React, { useState } from 'react';
import styles from './Table.module.css';

export interface Column<T> {
    columnId: string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

interface TableProps<T extends object> {
    columns: Column<T>[];
    data: T[] | undefined | null; 
    onRowClick?: (item: T) => void;
    isSelectable?: boolean; 
    getUniqueKey: (item: T) => string | number;
}

const Table = <T extends object>({ columns, data, onRowClick, getUniqueKey, isSelectable = false }: TableProps<T>) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const safeData = Array.isArray(data) ? data : [];

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = safeData.map(item => (item as { id: number }).id as number);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const isAllSelected = safeData.length > 0 && selectedIds.length === safeData.length;

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {isSelectable && (
                        <th key="checkbox-header" className={styles.th}>
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={isAllSelected}
                            />
                        </th>
                        )}
                        {columns.map(column => (

                            <th key={column.columnId as string} className={styles.th}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {safeData.map(item => (
                        <tr key={getUniqueKey(item)} onClick={() => onRowClick?.(item)}
                        className={onRowClick ? styles.clickableRow : ''}
                    >   {isSelectable && (
                            <td key={`${(item as { id: string | number }).id}-checkbox`} className={styles.td}>
                                <input
                                    type="checkbox"
                                    onChange={() => handleSelectOne((item as { id: number }).id)}
                                    checked={selectedIds.includes((item as { id: number }).id)}
                                />
                            </td>
                        )}
                        {columns.map(column => (
                            <td key={`${getUniqueKey(item)}-${String(column.columnId)}`}> 
                                {column.render ? column.render(item) : (item[column.columnId as keyof T] as React.ReactNode)}
                            </td>
                        ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;