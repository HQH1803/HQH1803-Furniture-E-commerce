import React, { useState, useEffect } from 'react';
import ProductList from './ProductList'; 
import ServiceList from './ServiceList';

function Ban() {     
  return (
    <div className='main-content'> 
        <div >
            <img className='banner'
                src={require("../images/Room/banner_phongkhach_ban.webp")}
                alt="Bàn Sofa - Bàn Cafe - Bàn Trà"/>
        </div> 
        <div className='container'>   
          <ProductList apiUrl="http://localhost:4000/api/ban-cafe-sofa" showCategories={false} title="Bàn Sofa - Bàn Cafe - Bàn Trà"/>
           
        </div>
    </div>
  );
}

export default Ban;
