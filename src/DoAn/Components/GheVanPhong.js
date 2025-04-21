import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function GheVanPhong() {
const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/ghe-van-phong`
  return (
    <div className='main-content'>
        <div className="banner-collection-header text-center">
            <img 
                className='banner' 
                src={require("../images/Room/banner_phonglamviec_ghevanphong.webp")}
                alt="Ghế Văn Phòng"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Ghế Văn Phòng"/>
            
        </div>
    </div>
  );
}

export default GheVanPhong;
