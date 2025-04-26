import React from 'react';
import '../css/Pagination.css';

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const renderPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <li key={1} className={`page-item page-node ${1 === currentPage ? 'current active' : ''}`}>
        <a onClick={() => paginate(1)} href="#" className="page-link">
          1
        </a>
      </li>
    );

    // Add ellipsis and numbers around current page
    if (currentPage > 3) {
      pages.push(
        <li key="ellipsis1" className="page-item">
          <span className="page-link">...</span>
        </li>
      );
    }

    // Show current page and one page before and after
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip if it's first or last page
      pages.push(
        <li key={i} className={`page-item page-node ${i === currentPage ? 'current active' : ''}`}>
          <a onClick={() => paginate(i)} href="#" className="page-link">
            {i}
          </a>
        </li>
      );
    }

    // Add ellipsis before last page
    if (currentPage < totalPages - 2) {
      pages.push(
        <li key="ellipsis2" className="page-item">
          <span className="page-link">...</span>
        </li>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(
        <li key={totalPages} className={`page-item page-node ${totalPages === currentPage ? 'current active' : ''}`}>
          <a onClick={() => paginate(totalPages)} href="#" className="page-link">
            {totalPages}
          </a>
        </li>
      );
    }

    return pages;
  };

  return (
    <nav id="pagination">
      <ul className="pagination">
        <li className={`page-item prev ${currentPage === 1 ? 'disabled' : ''}`}>
          <a onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            href="#"
            className="page-link">
            &#10094;
          </a>
        </li>
        
        {renderPageNumbers()}

        <li className={`page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
          <a onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            href="#"
            className="page-link">
            &#10095;
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
