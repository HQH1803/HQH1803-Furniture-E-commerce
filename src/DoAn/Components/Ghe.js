import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function Ghe() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/ghe-sofa`
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongkhach_ghesofa.jpg")}
                alt="Ghế Sofa"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Ghế Sofa"/>
            
        </div>
    </div>
  );
}

export default Ghe;
