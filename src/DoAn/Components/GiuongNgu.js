import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function GiuongNgu() {
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongngu_giuong.webp")}
                alt="Giường Ngủ"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl="http://furniture-e-commerce-wt2i.onrender.com/api/giuong-ngu" showCategories={false} title="Giường Ngủ"/>
            
        </div>
    </div>
  );
}

export default GiuongNgu;
