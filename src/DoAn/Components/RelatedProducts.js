import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { message} from 'antd';
import { useUser } from '../contexts/UserContext'; 

const RelatedProducts = () => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { customerUser} = useUser();  // Access both admin and customer users from UserContext

    const [favorites, setFavorites] = useState(new Set());
    // Lấy sản phẩm ngẫu nhiên
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/san-pham-ngau-nhien`)
      .then((res) => {
        setRelatedProducts(res.data);
      })
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);
  const handleFavoriteClick = async (productId) => {
    try {
        // Kiểm tra nếu user đã đăng nhập
        if (!customerUser || !customerUser.email) {
            message.error('Vui lòng đăng nhập tài khoản');
            return;
        }

        if (favorites.has(productId)) {
            // Nếu sản phẩm đã yêu thích, gọi API xóa
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/favorites`, {
                data: {
                    userEmail: customerUser.email,
                    productId: productId,
                },
            });
            message.success('Đã bỏ yêu thích');
        } else {
            // Nếu sản phẩm chưa yêu thích, gọi API thêm yêu thích
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/favorites`, {
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
    <div className="list-productRelated clearfix check-1">
        <div className="heading-title text-center">
            <h2>Sản phẩm gợi ý</h2>
            <div className="row">
            {relatedProducts.map((relatedProduct) => {     
              return (
                <div key={relatedProduct.id} className="product-card">
                  <div className="product-image-container">
                    <a
                      href="#"
                      onClick={(e) => {
                          e.preventDefault();
                          handleFavoriteClick(relatedProduct.id); // Gọi hàm xử lý khi bấm vào nút yêu thích
                      }}
                      aria-label="Yêu thích"
                      className={`onwishlist_btn_add ${favorites.has(relatedProduct.id) ? 'active' : ''}`} // Thêm class active nếu sản phẩm đã được yêu thích
                      data-handle={relatedProduct.handle}
                      data-title={relatedProduct.tenSP}
                      data-id={relatedProduct.id}
                      data-price={relatedProduct.gia}
                      title=""
                      >
                      <img
                          className="wishlist-icon"
                          src={favorites.has(relatedProduct.id) 
                          ? require("../images/Logo/favorite_filled.webp") 
                          : require("../images/Logo/favorite.webp")}
                      // Sử dụng hình ảnh khác nếu yêu thích
                          alt="Yêu thích"
                      />
                    </a>
                    <a href={`/chitietsanpham/${relatedProduct.id}`} title={relatedProduct.tenSP} className="product-image-link">
                        <img className="product-image" src={`${relatedProduct.hinh_anh}`} alt={relatedProduct.tenSP} />
                    </a>
                  </div>
                  <div className="product-info-container">
                    <h3 className="product-name">
                      <a href={`/chitietsanpham/${relatedProduct.id}`} title={relatedProduct.tenSP}>{relatedProduct.tenSP}</a>
                    </h3>
                    <div className="product-price">
                      <span className="current-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(relatedProduct.gia)}
                      </span>
                      {relatedProduct.gia && (
                        <span className="original-price">
                          <del>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(relatedProduct.gia_goc)}</del>
                        </span>
                      )}
                    </div>
                    <div className="product-actions-container">
                      <a href={`/chitietsanpham/${relatedProduct.id}`} className="btn btn-detail">Xem Chi Tiết</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>     
    </div>
  );
};

export default RelatedProducts;
