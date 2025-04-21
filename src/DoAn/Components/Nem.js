import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function Nem() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/nem`
  return (
    <div className="row">
        <img 
            className='banner'
            src={require("../images/Room/banner_phongngu_nem.jpg")}
            alt="Nệm"/>
        <div className='container'>   
            <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Nệm"/>
            
        </div>
    </div>

  );
}

export default Nem;
