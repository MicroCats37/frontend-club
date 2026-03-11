import { useCallback, useState } from "react";

interface usePaginationProps {
	initialPage?: number;
	initialPageSize?: number;
}

export function usePagination({
	initialPage = 1,
	initialPageSize = 10,
}: usePaginationProps = {}) {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);

	const onPageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	const onPageSizeChange = useCallback((newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1); // Reset to first page when page size changes
	}, []);

	return {
		page,
		pageSize,
		onPageChange,
		onPageSizeChange,
		// Helper to get params for useApiQuery
		paginationParams: {
			page,
			page_size: pageSize,
		},
	};
}
