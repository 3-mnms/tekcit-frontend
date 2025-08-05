import React, {useState} from 'react';
import styles from './UserList.module.css';

interface User {
    id: number;
    name: string;
    userId: string;
    phone: string;
    email: string;
    genre: string;
    businessName: string;
    pw?: string;
    isActive: boolean;
}

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void; // 삐약! onToggleStatus 함수 prop을 boolean으로 변경!
}

const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
    // 삐약! 선택된 사용자 ID를 저장할 상태!
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    // 삐약! 전체 선택/해제 로직!
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // 전체 선택 시, 모든 사용자의 ID를 selectedUserIds에 넣습니다!
            const allIds = users.map(user => user.id);
            setSelectedUserIds(allIds);
        } else {
            // 전체 해제 시, selectedUserIds를 비웁니다!
            setSelectedUserIds([]);
        }
    };

    // 삐약! 개별 선택/해제 로직!
    const handleSelectOne = (id: number) => {
        if (selectedUserIds.includes(id)) {
            // 이미 선택된 상태면, 해당 ID를 제거합니다!
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id));
        } else {
            // 선택되지 않았으면, 해당 ID를 추가합니다!
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    // 삐약! 전체 선택 체크박스의 상태를 결정하는 변수!
    const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;

    return (
        <div className={styles.tableContainer}>
            <table className={styles.userTable}>
                <thead>
                    <tr>
                        <th>
                            <input 
                                type="checkbox" 
                                onChange={handleSelectAll} 
                                checked={isAllSelected}
                            />
                        </th>
                        <th>이름</th>
                        <th>아이디</th>
                        <th>전화번호</th>
                        <th>이메일</th>
                        <th>장르</th>
                        <th>비밀번호</th>
                        <th>사업자명</th>
                        <th>계정 상태</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                <input 
                                    type="checkbox" 
                                    onChange={() => handleSelectOne(user.id)}
                                    checked={selectedUserIds.includes(user.id)}
                                />
                            </td>
                            <td>{user.name}</td>
                            <td>{user.userId}</td>
                            <td>{user.phone}</td>
                            <td>{user.email}</td>
                            <td>{user.genre}</td>
                            <td>
                                {user.pw ? `${user.pw.substring(0, 3)}****` : '********'}
                            </td>
                            <td>{user.businessName}</td>
                            <td>
                                <ToggleSwitch 
                                    isActive={user.isActive}
                                    onChange={() => onToggleStatus(user.userId, user.isActive)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ToggleSwitch: React.FC<{ isActive: boolean; onChange: () => void }> = ({ isActive, onChange }) => {
    return (
        <label className={styles.switch}>
            <input type="checkbox" checked={isActive} onChange={onChange} />
            <span className={styles.slider}>
                <span className={styles.onText}>활성화</span>
                <span className={styles.offText}>정지</span>
            </span>
        </label>
    );
};

export default UserList;