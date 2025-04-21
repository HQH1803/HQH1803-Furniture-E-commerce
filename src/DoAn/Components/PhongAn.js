import React from 'react';
import ServiceList from './ServiceList';
import MoTaLoaiPhong from './MoTaLoaiPhong';
import ProductList from './ProductList'; 

function PhongAn() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/phong-an`
  return (
    <div className='main-content'>
        <div>
            <img className='banner'
                srcset={require("../images/Room/banner_phongan.webp")}
                alt="Nội Thất Phòng Ăn - Nội Thất Nhà Bếp Hiện Đại"/>
        </div>
        <div className='container'>            
            <ProductList apiUrl={SANPHAM_URL} showCategories={true} title="Sản phẩm Dành cho phòng ăn"/>
                  
            <MoTaLoaiPhong id={4}/>  
        </div>      
    </div>
  );
}

export default PhongAn;
