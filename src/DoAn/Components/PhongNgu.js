import React from 'react';
import ServiceList from './ServiceList';
import MoTaLoaiPhong from './MoTaLoaiPhong';
import ProductList from './ProductList'; 
function PhongNgu() {
const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/phong-ngu`
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                srcset={require("../images/Room/banner_phongngu.jpg")}
                alt="Nội Thất Phòng Ngủ"/>
        </div>
        <div className='container'>
            <ProductList apiUrl={SANPHAM_URL} showCategories={true} title="Sản phẩm Dành cho phòng ngủ"/>
            
            <MoTaLoaiPhong id={2}/>
        </div>
    </div>
  );
}

export default PhongNgu;
