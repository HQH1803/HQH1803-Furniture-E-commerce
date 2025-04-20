import React from 'react';
import ServiceList from './ServiceList';
import MoTaLoaiPhong from './MoTaLoaiPhong';
import ProductList from './ProductList'; 
function PhongLamViec() {
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                srcset={require("../images/Room/banner_phonglamviec.webp")}
                alt="Nội Thất Phòng Làm Việc"/>
        </div>        
        <div className='container'>
            <ProductList apiUrl="http://localhost:4000/api/phong-lam-viec" showCategories={true} title="Sản phẩm Dành cho phòng làm việc"/>
            
            <MoTaLoaiPhong id={3}/>
        </div>
    </div>
  );
}

export default PhongLamViec;
