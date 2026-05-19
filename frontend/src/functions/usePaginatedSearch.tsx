// Path: @/functions/usePaginatedSearch.tsx

import { useState, useMemo } from 'react';

export const usePaginatedSearch = (dataArray, searchKey, itemsPerPage = 5) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData = useMemo(() => {
        // Arama terimi boşsa veya veri yoksa, tüm veriyi döndür
        if (!searchTerm || !Array.isArray(dataArray)) {
            return dataArray || [];
        }
        // Arama yap
        return dataArray.filter(item =>
            item[searchKey] && item[searchKey].toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [dataArray, searchTerm, searchKey]);

    const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData, itemsPerPage]);

    const currentItems = useMemo(() => {
        // Sayfa değiştiğinde ve arama yapıldığında currentPage'i sıfırla
        if (currentPage > totalPages && totalPages > 0) {
           setCurrentPage(1);
        }
        return filteredData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredData, currentPage, itemsPerPage, totalPages]);
    
    // Arama yapıldığında sayfayı 1'e döndürmek için setSearchTerm'i sarmalayan fonksiyon
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return {
        searchTerm,
        setSearchTerm: handleSearch, // Sarmalanmış fonksiyonu kullan
        currentPage,
        handlePageChange,
        currentItems,
        totalPages,
    };
};