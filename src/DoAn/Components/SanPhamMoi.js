import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { message} from 'antd';
import { useUser } from '../contexts/UserContext'; 
const SanPhamMoi = () => {
    const { customerUser } = useUser();  // Access both admin and customer use
  const [sanphammoi, setSanphammoi] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/san-pham-moi`)
      .then((res) => {
        const pr = res.data;
        setSanphammoi(pr);
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
                await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
                    data: {
                        userEmail: customerUser.email,
                        productId: productId,
                    },
                });
                message.success('Đã bỏ yêu thích');
            } else {
                // Nếu sản phẩm chưa yêu thích, gọi API thêm yêu thích
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
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
    <div>
        <div className="site-animation">
            <h2>SẢN PHẨM MỚI NHẤT</h2>
            <span className="view-more">
              <a href="/sanphams/tat-ca-san-pham"> Xem thêm </a>
            </span>
        </div>
        <div className="row">
            {sanphammoi.map((product) => {
                return (
                    <div key={product.id} className="product-card">
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
                        <a href={`/chitietsanpham/${product.id}`} title={product.tenSP}>{product.tenSP}</a>
                    </h3>
                    <div className="product-price">
                        <span className="current-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                        </span>
                        {product.gia && (
                        <span className="original-price">
                            <del>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}</del>
                        </span>
                        )}
                    </div>
                    <div className="product-actions-container">
                        <a href={`/chitietsanpham/${product.id}`} className="btn btn-detail">Xem Chi Tiết</a>
                    </div>
                    </div>
                </div>
                );
            })}
        </div>
    </div>
    
  );
};

export default SanPhamMoi;
