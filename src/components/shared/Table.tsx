// src/components/shared/Table.tsx
import React, { useState } from 'react';
import styles from './Table.module.css';

export interface Column<T> {
    id: keyof T;
    label: string;
    render?: (item: T) => React.ReactNode;
}

// 삐약! id 속성이 string 또는 number 타입이어야 한다고 명확하게 제약 조건을 걸어줍니다!
interface TableProps<T extends { id: string | number }> {
    columns: Column<T>[];
    data: T[];
}

// 삐약! 컴포넌트의 제네릭에도 동일한 제약 조건을 적용합니다!
const Table = <T extends { id: string | number }>({ columns, data }: TableProps<T>) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = data.map(item => item.id as number);
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
                        <th>
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={isAllSelected}
                            />
                        </th>
                        {columns.map(column => (
                            <th key={column.id as string}>{column.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={() => handleSelectOne(item.id as number)}
                                    checked={selectedIds.includes(item.id as number)}
                                />
                            </td>
                            {columns.map(column => (
                                <td key={column.id as string}>
                                    {column.render ? column.render(item) : (item[column.id] as React.ReactNode)}
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