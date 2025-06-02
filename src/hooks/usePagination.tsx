import { useState } from 'react';
import {PaginationParams} from "../services/api.ts";


export const usePagination = (initialPage = 0, initialSize = 10) => {
    const [pagination, setPagination] = useState<PaginationParams>({
        page: initialPage,
        size: initialSize,
        sortBy: 'createdAt',
        direction: 'DESC',
    });

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleSizeChange = (newSize: number) => {
        setPagination(prev => ({ ...prev, size: newSize, page: 0 })); // Reset to first page
    };

    const handleSort = (newSortBy: string) => {
        setPagination(prev => ({
            ...prev,
            sortBy: newSortBy,
            direction: prev.sortBy === newSortBy && prev.direction === 'ASC' ? 'DESC' : 'ASC',
            page: 0 // Reset to first page when sorting changes
        }));
    };

    return {
        pagination,
        handlePageChange,
        handleSizeChange,
        handleSort,
    };
};