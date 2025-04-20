import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function Ghe() {
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongkhach_ghesofa.jpg")}
                alt="Ghế Sofa"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl="http://localhost:4000/api/ghe-sofa" showCategories={false} title="Ghế Sofa"/>
            
        </div>
    </div>
  );
}

export default Ghe;
