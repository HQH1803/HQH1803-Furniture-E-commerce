import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import Pagination from './Pagination';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import _ from 'lodash';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import config from '../../config/config';
import { toast } from 'react-toastify';

function Product({ products, productsPerPage, currentPage, setCurrentPage }) {
  const { customerUser} = useUser();  // Access both admin and customer users from UserContext
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]); // State để lưu sản phẩm yêu thích

  // Calculate the products to display on the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    const fetchFavorites = async () => {
        try {
            const response = await api.get(config.endpoints.favorites.get(customerUser.email));
            setFavorites(response.data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Không thể tải danh sách yêu thích');
        }
    };

    if (customerUser) {
        fetchFavorites();
    }
  }, [customerUser]);
  
  const handleAddToFavorites = async (productId) => {
    if (!customerUser) {
        navigate('/dang-nhap');
        return;
    }

    try {
        if (favorites.some(fav => fav.product_id === productId)) {
            await api.delete(config.endpoints.favorites.delete(customerUser.email, productId));
            setFavorites(favorites.filter(fav => fav.product_id !== productId));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } else {
            const response = await api.post(config.endpoints.favorites.add, {
                customer_email: customerUser.email,
                product_id: productId
            });
            setFavorites([...favorites, response.data]);
            toast.success('Đã thêm vào danh sách yêu thích');
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        toast.error('Không thể cập nhật danh sách yêu thích');
    }
};

  return (
    <div className="container">
      <div className="row">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div key={product.id}  className={`product-card ${product.soluong === 0 ? 'out-of-stock' : ''}`}>
              <div className="product-image-container">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToFavorites(product.id); // Gọi hàm xử lý khi bấm vào nút yêu thích
                  }}
                  aria-label="Yêu thích"
                  className={`onwishlist_btn_add ${favorites.some(fav => fav.product_id === product.id) ? 'active' : ''}`} // Thêm class active nếu sản phẩm đã được yêu thích
                  data-handle={product.handle}
                  data-title={product.tenSP}
                  data-id={product.id}
                  data-price={product.gia}
                  title=""
                >
                  <img
                    className="wishlist-icon"
                    src={favorites.some(fav => fav.product_id === product.id) 
                      ? require("../images/Logo/favorite_filled.webp") 
                      : require("../images/Logo/favorite.webp")}
                  // Sử dụng hình ảnh khác nếu yêu thích
                    alt="Yêu thích"
                  />
                </a>
                <a href={`/chitietsanpham/${product.id}`} title={product.tenSP} className="product-image-link">
                  <img className="product-image" src={`${product.hinh_anh}`} alt={product.tenSP} />
                </a>
              </div>
              <div className="product-info-container">    
                <h3 className="product-name">
                  <a href={`/chitietsanpham/${product.id}`} title={product.tenSP}>
                    {_.truncate(product.tenSP, {
                      'length': 45, // Giới hạn độ dài ký tự, bạn có thể tùy chỉnh
                      'separator': ' ', // Ngắt chuỗi tại khoảng trắng
                      'omission': '...' // Thêm dấu "..." vào cuối chuỗi nếu vượt quá giới hạn
                    })}
                  </a>
                </h3>

                <div className="product-price">
                  <span className="current-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                  </span>
                  {product.gia_goc && (
                    <span className="original-price">
                      <del>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia_goc)}
                      </del>
                    </span>
                  )}
                </div>
                <div className="product-actions-container">
                  <a href={`/chitietsanpham/${product.id}`} className="btn btn-detail">
                    Xem Chi Tiết
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">Không có sản phẩm nào để hiển thị.</div>
        )}
      </div>
      <Pagination
        productsPerPage={productsPerPage}
        totalProducts={products.length}
        paginate={setCurrentPage}
        currentPage={currentPage}
      />      
    </div>
    
  );
}

export default Product;
