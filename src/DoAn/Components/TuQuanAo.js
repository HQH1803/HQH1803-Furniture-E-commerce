import React from 'react';
import ProductList from './ProductList'; 
function TuQuanAo() {
  const SANPHAM_URL = `${process.env.REACT_APP_API_BASE_URL}/api/tu-quan-ao`
  return (
    <div className='main-content'>
        <div>
            <img 
                className='banner'
                src={require("../images/Room/banner_phongngu_tuquanao.webp")}
                alt="Tủ Quần Áo"/>
        </div>
        <div className='container'>   
            <ProductList apiUrl={SANPHAM_URL} showCategories={false} title="Tủ Quần Áo"/>
            
        </div>
    </div>
  );
}

export default TuQuanAo;
