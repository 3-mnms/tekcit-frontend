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
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

const Table = <T extends object>({ columns, data, onRowClick, getUniqueKey, isSelectable = false, onSelectionChange }: TableProps<T>) => {
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    React.useEffect(() => {
        onSelectionChange?.(selectedIds);
    }, [selectedIds, onSelectionChange]);

    const safeData = Array.isArray(data) ? data : [];

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = safeData.map(item => getUniqueKey(item));
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (key: string | number) => {
        if (selectedIds.includes(key)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== key));
        } else {
            setSelectedIds([...selectedIds, key]);
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
                    {safeData.map(item => {
                        const key = getUniqueKey(item);
                        return (
                            <tr key={key} onClick={() => onRowClick?.(item)}
                                className={onRowClick ? styles.clickableRow : ''}
                            >
                                {isSelectable && (
                                    <td key={`${key}-checkbox`} className={styles.td}>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectOne(key)}
                                            checked={selectedIds.includes(key)}
                                        />
                                    </td>
                                )}
                                {columns.map(column => (
                                    <td key={`${key}-${String(column.columnId)}`}> 
                                        {column.render ? column.render(item) : (item[column.columnId as keyof T] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Table;