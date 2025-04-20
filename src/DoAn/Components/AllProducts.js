import React, { useState, useEffect } from 'react';
import ProductList from './ProductList'; 


function AllProducts() {

  return (
    <div className="container">      
        <ProductList apiUrl="http://localhost:4000/api/san-pham" showCategories={true} title="Tất Cả Sản Phẩm"/>
      </div>
  );
}

export default AllProducts;
