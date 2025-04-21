import React from 'react';
import ServiceList from './ServiceList';
import MoTaLoaiPhong from './MoTaLoaiPhong';
import ProductList from './ProductList'; 
function PhongLamViec() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/phong-lam-viec`
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                srcset={require("../images/Room/banner_phonglamviec.webp")}
                alt="Nội Thất Phòng Làm Việc"/>
        </div>        
        <div className='container'>
            <ProductList apiUrl={SANPHAM_URL} showCategories={true} title="Sản phẩm Dành cho phòng làm việc"/>
            
            <MoTaLoaiPhong id={3}/>
        </div>
    </div>
  );
}

export default PhongLamViec;
