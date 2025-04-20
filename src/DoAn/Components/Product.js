import React, { useEffect, useState } from 'react';
import { message} from 'antd';
import Pagination from './Pagination';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import _ from 'lodash';
function Product({ products, productsPerPage, currentPage, setCurrentPage }) {
  const { customerUser} = useUser();  // Access both admin and customer users from UserContext

  const [favorites, setFavorites] = useState(new Set()); // State để lưu sản phẩm yêu thích

  // Calculate the products to display on the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`http://furniture-e-commerce-wt2i.onrender.com/api/favorites/${customerUser.email}`);
            setFavorites(new Set(response.data.favorites));
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm yêu thích:', error);
        }
    };

    if (customerUser) {
        fetchFavorites();
    }
  }, [customerUser]);
  
  const handleFavoriteClick = async (productId) => {
    try {
        // Kiểm tra nếu user đã đăng nhập
        if (!customerUser || !customerUser.email) {
            message.error('Vui lòng đăng nhập tài khoản');
            return;
        }

        if (favorites.has(productId)) {
            // Nếu sản phẩm đã yêu thích, gọi API xóa
            await axios.delete('http://furniture-e-commerce-wt2i.onrender.com/api/favorites', {
                data: {
                    userEmail: customerUser.email,
                    productId: productId,
                },
            });
            message.success('Đã bỏ yêu thích');
        } else {
            // Nếu sản phẩm chưa yêu thích, gọi API thêm yêu thích
            const response = await axios.post('http://furniture-e-commerce-wt2i.onrender.com/api/favorites', {
                user_email: customerUser.email,
                product_id: productId,
            });
            message.success(response.data.message); // Hiển thị thông báo thành công
        }

        // Cập nhật danh sách yêu thích
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId); // Xóa nếu đã yêu thích
            } else {
                newFavorites.add(productId); // Thêm nếu chưa yêu thích
            }
            return newFavorites;
        });
    } catch (error) {
        console.error('Lỗi khi xử lý yêu thích:', error.response ? error.response.data : error.message);
        // Xử lý lỗi nếu cần (ví dụ: thông báo cho người dùng)
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
                    handleFavoriteClick(product.id); // Gọi hàm xử lý khi bấm vào nút yêu thích
                  }}
                  aria-label="Yêu thích"
                  className={`onwishlist_btn_add ${favorites.has(product.id) ? 'active' : ''}`} // Thêm class active nếu sản phẩm đã được yêu thích
                  data-handle={product.handle}
                  data-title={product.tenSP}
                  data-id={product.id}
                  data-price={product.gia}
                  title=""
                >
                  <img
                    className="wishlist-icon"
                    src={favorites.has(product.id) 
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
