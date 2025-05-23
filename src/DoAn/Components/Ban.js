import React, { useState, useEffect } from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';

function Ban() {     
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/ban-cafe-sofa`
  return (
    <div className='main-content'> 
        <div >
            <img className='banner'
                src={require("../images/Room/banner_phongkhach_ban.webp")}
                alt="Bàn Sofa - Bàn Cafe - Bàn Trà"/>
        </div> 
        <div className='container'>   
          <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Bàn Sofa - Bàn Cafe - Bàn Trà"/>
           
        </div>
    </div>
  );
}

export default Ban;
