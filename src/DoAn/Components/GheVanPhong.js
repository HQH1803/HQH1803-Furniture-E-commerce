import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function GheVanPhong() {

  return (
    <div className='main-content'>
        <div className="banner-collection-header text-center">
            <img 
                className='banner' 
                src={require("../images/Room/banner_phonglamviec_ghevanphong.webp")}
                alt="Ghế Văn Phòng"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl="http://localhost:4000/api/ghe-van-phong" showCategories={false} title="Ghế Văn Phòng"/>
            
        </div>
    </div>
  );
}

export default GheVanPhong;
