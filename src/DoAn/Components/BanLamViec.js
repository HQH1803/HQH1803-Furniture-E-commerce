import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function BanLamViec() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/ban-lam-viec`
  return (    
    <div className='main-content'>
        <div>
            <img 
                className='banner' 
                src={require("../images/Room/banner_phonglamviec_banlamviec.webp")}
                alt="Bàn Làm Việc"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Bàn làm việc"/>
            
        </div>
    </div>
  );
}

export default BanLamViec;
