// ProductList.js
import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import FilterSidebar from './FilterSidebar';
import RelatedProducts from './RelatedProducts';
import Product from './Product';
import "../css/Products.css";

const ProductList = ({ apiUrl, showCategories, title }) => {
  const [sanpham, setSanpham] = useState([]);
  const [filteredSanpham, setFilteredSanpham] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [productsPerPage, setProductsPerPage] = useState(window.innerWidth <= 480 ? 3 : 9);
  
  useEffect(() => {
    const handleResize = () => {
      setProductsPerPage(window.innerWidth <= 480 ? 3 : 9);
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(apiUrl);
        setSanpham(response.data);
        setFilteredSanpham(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl]);

  const handleFilterChange = (filters) => {
    const { colors, categories, sizes, priceRange, sortOption } = filters;

    const filtered = sanpham.filter(product => {
      const inPriceRange = product.gia >= priceRange[0] && product.gia <= priceRange[1];
      
      // Xử lý lọc màu
      const productColors = product.mau_sac_ids ? product.mau_sac_ids.split(',').map(id => id.trim()) : [];
      const colorsString = colors.map(colorId => String(colorId));
      const matchesColor = colors.length === 0 || productColors.some(colorId => colorsString.includes(String(colorId)));
      console.log("KQMau",matchesColor)
      // Xử lý lọc loại
      const matchesCategory = categories.length === 0 || categories.includes(product.id_loaiSP);
      console.log("KQLoaiSP",matchesCategory)
      console.log("KQLoaiSP",product.id_loaiSP)

      // Xử lý lọc kích thước
      const productSizes = product.kich_thuoc_ids ? product.kich_thuoc_ids.split(',').map(id => id.trim()) : [];
      const sizesString = sizes.map(sizeId => String(sizeId));
      const matchesSize = sizes.length === 0 || productSizes.some(sizeId => sizesString.includes(String(sizeId)));
      return inPriceRange && matchesColor && matchesCategory && matchesSize;
  });
  

    setFilteredSanpham(filtered);
    setCurrentPage(1);
    setSortOption(sortOption);
  };

  const sortProducts = (products) => {
    return products.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.id - a.id;
        case 'priceAsc':
          return a.gia - b.gia;
        case 'priceDesc':
          return b.gia - a.gia;
        default:
          return 0;
      }
    });
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredSanpham.length === sanpham.length 
    ? sortProducts([...sanpham])
    : sortProducts([...filteredSanpham]).slice(indexOfFirstProduct, indexOfLastProduct);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredSanpham.length / productsPerPage);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (    
    <div>
      <h1 className="title">
        {title}
      </h1>  
      <div className="flex-div">      
        <div className="sidebar">
            <FilterSidebar onFilterChange={handleFilterChange} showCategories={showCategories} />
        </div>
        <div className="main-content">      
          {filteredSanpham.length === 0 ? ( // Kiểm tra xem có sản phẩm nào không
              <div className="no-products">Không có sản phẩm nào phù hợp với bộ lọc của bạn.</div>
            ) : (        
              <Product 
              products={currentProducts}
              productsPerPage={productsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              paginate={paginate} 
              /> 
            )}
        </div>
      </div> 
      <RelatedProducts />
    </div> 
    
  );
};

export default ProductList;
