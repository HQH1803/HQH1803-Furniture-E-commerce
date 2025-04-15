import React from 'react';
import '../css/Pagination.css';
const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

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
        {pageNumbers.map(number => (
          <li key={number} className={`page-item page-node ${number === currentPage ? 'current active' : ''}`}>
            <a onClick={() => paginate(number)} href="#" className="page-link">
              {number}
            </a>
          </li>
        ))}
        <li className={`page-item next ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
          <a onClick={() => currentPage < pageNumbers.length && paginate(currentPage + 1)}
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
