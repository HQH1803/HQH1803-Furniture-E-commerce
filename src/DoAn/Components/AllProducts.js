import React, { useState, useEffect } from 'react';
import ProductList from './ProductList'; 


function AllProducts() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/san-pham`
  return (
    <div className="container">      
        <ProductList apiUrl={SANPHAM_URL} showCategories={true} title="Tất Cả Sản Phẩm"/>
      </div>
  );
}

export default AllProducts;
