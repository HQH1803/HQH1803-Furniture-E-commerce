import React from 'react';
import ServiceList from './ServiceList';
import MoTaLoaiPhong from './MoTaLoaiPhong';
import ProductList from './ProductList'; 
function PhongNgu() {

  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                srcset={require("../images/Room/banner_phongngu.jpg")}
                alt="Nội Thất Phòng Ngủ"/>
        </div>
        <div className='container'>
            <ProductList apiUrl="http://localhost:4000/api/phong-ngu" showCategories={true} title="Sản phẩm Dành cho phòng ngủ"/>
            
            <MoTaLoaiPhong id={2}/>
        </div>
    </div>
  );
}

export default PhongNgu;
