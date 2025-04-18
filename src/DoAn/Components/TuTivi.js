import React from 'react';
import ProductList from './ProductList'; 
function TuTivi() {

  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongkhach_tutivi.webp")}
                alt="Tủ Kệ Tivi Hiện Đại"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl="http://localhost:4000/api/tu-tivi" showCategories={false} title="Tủ Kệ Tivi Hiện Đại"/>
            
        </div>
    </div>
  );
}

export default TuTivi;
