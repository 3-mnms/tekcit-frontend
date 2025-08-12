import React, { useState } from 'react';
import styles from './Table.module.css';

export interface Column<T> {
    columnId: string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

interface TableProps<T extends object> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    isSelectable?: boolean; 
}

const Table = <T extends object>({ columns, data, onRowClick, isSelectable = false }: TableProps<T>) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = data.map(item => (item as { id: number }).id as number);
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

    const isAllSelected = data.length > 0 && selectedIds.length === data.length;

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
                            // 삐약! 모든 <th>에 고유한 key를 부여합니다.
                            <th key={column.columnId as string} className={styles.th}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={(item as { id: string | number }).id} onClick={() => onRowClick?.(item)}
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
                            <td key={`${(item as { id: string | number }).id}-${String(column.columnId)}`}> 
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