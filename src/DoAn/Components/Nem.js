import React from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';
function Nem() {
  return (
    <div className="row">
        <img 
            className='banner'
            src={require("../images/Room/banner_phongngu_nem.jpg")}
            alt="Nệm"/>
        <div className='container'>   
            <ProductList apiUrl="${process.env.REACT_APP_API_BASE_URL}/nem" showCategories={false} title="Nệm"/>
            
        </div>
    </div>

  );
}

export default Nem;
