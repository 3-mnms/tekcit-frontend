import React from 'react';
import styles from './SearchBox.module.css';
import { IoIosSearch } from "react-icons/io";

interface SearchBarProps {
    searchTerm: string;
    onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch }) => {
    return (
        <div className={styles.searchContainer}>
            <input 
                type="text" 
                placeholder="검색어를 입력하세요!" 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)} 
            />
            <div className={styles.searchButton}>
                <IoIosSearch />
            </div>
        </div>
    );
};

export default SearchBar;