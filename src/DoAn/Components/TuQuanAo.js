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
            <ProductList apiUrl="http://furniture-e-commerce-wt2i.onrender.com/api/tu-quan-ao" showCategories={false} title="Tủ Quần Áo"/>
            
        </div>
    </div>
  );
}

export default TuQuanAo;
