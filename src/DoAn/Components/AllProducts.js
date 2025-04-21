import React, { useState, useEffect } from 'react';
import ProductList from './ProductList'; 


function AllProducts() {

  return (
    <div className="container">      
        <ProductList apiUrl="${process.env.REACT_APP_API_BASE_URL}/san-pham" showCategories={true} title="Tất Cả Sản Phẩm"/>
      </div>
  );
}

export default AllProducts;
