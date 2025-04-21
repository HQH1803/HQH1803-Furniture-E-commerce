import React from 'react';
import ServiceList from './ServiceList';
import MoTaLoaiPhong from './MoTaLoaiPhong';
import ProductList from './ProductList'; 
function PhongKhach() {    
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                srcset={require("../images/Room/banner_phongkhach.webp")}
                alt="Nội Thất Phòng Khách"/>
        </div>
        <div className='container'>
            <ProductList apiUrl="${process.env.REACT_APP_API_BASE_URL}/phong-khach" showCategories={true} title="Sản phẩm Dành cho phòng khách"/>
            
            <MoTaLoaiPhong id={1}/>
        </div>
        
    </div>
  );
}

export default PhongKhach;
