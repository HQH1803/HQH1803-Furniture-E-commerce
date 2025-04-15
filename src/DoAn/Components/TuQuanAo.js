import React from 'react';
import ProductList from './ProductList'; 
function TuQuanAo() {
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongngu_tuquanao.webp")}
                alt="Tủ Quần Áo"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl="http://localhost:4000/api/tu-quan-ao" showCategories={false} title="Tủ Quần Áo"/>
            
        </div>
    </div>
  );
}

export default TuQuanAo;
