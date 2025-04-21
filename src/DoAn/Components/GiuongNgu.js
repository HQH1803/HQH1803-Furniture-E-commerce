import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function GiuongNgu() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/giuong-ngu`
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongngu_giuong.webp")}
                alt="Giường Ngủ"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Giường Ngủ"/>
            
        </div>
    </div>
  );
}

export default GiuongNgu;
