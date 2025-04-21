import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import '../css/ChiTietSanPham.css'; // Import file CSS cho styling
import { useCart } from '../contexts/CartContext';
import RelatedProducts from './RelatedProducts';
import ReviewForm from './ReviewForm';
import FacebookSDK from './FacebookSDK';
import { useUser } from '../contexts/UserContext';

const ChiTietSanPham = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // Thêm state cho số lượng
  const { addToCart, cart } = useCart();
  const [activeTab, setActiveTab] = useState('description');
  const articleUrl = `${process.env.REACT_APP_API_BASE_URL}/chitietsanpham/${id}`;
  const { customerUser} = useUser();  // Access both admin and customer users from UserContext

  const [favorites, setFavorites] = useState(new Set()); // State để lưu sản phẩm yêu thích
  // Hàm kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const isProductInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };
  const handleFavoriteClick = async (productId) => {
    try {
        // Kiểm tra nếu user chưa đăng nhập
        if (!customerUser || !customerUser.email) {
            message.error('Vui lòng đăng nhập tài khoản');
            return;
        }

        if (favorites.has(productId)) {
            // Nếu sản phẩm đã yêu thích, thông báo và thoát sớm
            message.info('Sản phẩm đã nằm trong danh sách yêu thích của bạn');
            return;
        }

        // Nếu sản phẩm chưa yêu thích, gọi API thêm yêu thích
        const response = await axios.post('${process.env.REACT_APP_API_BASE_URL}/favorites', {
            user_email: customerUser.email,
            product_id: productId,
        });

        message.success(response.data.message); // Hiển thị thông báo thành công

        // Cập nhật danh sách yêu thích
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.add(productId); // Thêm vào danh sách yêu thích
            return newFavorites;
        });
    } catch (error) {
        console.error('Lỗi khi xử lý yêu thích:', error.response ? error.response.data : error.message);
        message.info('Sản phẩm đã nằm trong danh sách yêu thích của bạn');
    }
};

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = () => {
    if (!customerUser || !customerUser.email) {
      message.error('Vui lòng đăng nhập tài khoản');
      return;
    }
    if (product) {
      if (product.soluong <= 0) {
        message.warning('Sản phẩm đã hết hàng!'); // Thông báo nếu sản phẩm hết hàng
      } else if (isProductInCart(product.id)) {
        message.warning('Sản phẩm đã có trong giỏ hàng!'); // Thông báo nếu sản phẩm đã có
      } else {
        addToCart({ ...product, quantity }); // Thêm sản phẩm vào giỏ hàng
        message.success('Thêm sản phẩm vào giỏ hàng thành công!'); // Hiển thị thông báo
      }
    }
  };


  // Lấy sản phẩm theo id
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chitietsanpham/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className='container'>
      <div className="product-container">
        <div className="product-image">
          <img src={`${product.hinh_anh}`} alt={product.tenSP}  style={{height: "670px"}}/>
        </div>
        <div className="product-details">
          <h1>{product.tenSP}</h1>
          <div className="product-price">
            <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}</span>
            {product.gia_goc && (
              <span className="pro-price-del">
                <del className="compare-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia_goc)}</del>
              </span>
            )}
          </div>
          <hr />
          <div className="product-size">
            <div dangerouslySetInnerHTML={{ __html: product.mo_ta_nho }}/>
          </div>
          <div className="product-quantity">
            <strong>Số lượng:</strong>
            <input
              type="number"
              value={quantity}
              min="1"
              onChange={(e) => {
                const newQuantity = Number(e.target.value);
                if (newQuantity > 5) {
                  message.warning('Bạn chỉ có thể thêm tối đa 5 sản phẩm.');
                
                } else {
                  setQuantity(newQuantity);
                }
              }}
            />
          </div>

          <div className="product-actions">
            <button className="add-to-cart" onClick={handleAddToCart}>THÊM VÀO GIỎ</button>
            <button className="buy-now"  onClick={(e) => {
                    e.preventDefault();
                    handleFavoriteClick(id); // Gọi hàm xử lý khi bấm vào nút yêu thích
                  }}>YÊU THÍCH</button>
          </div>
        </div>
      </div>
      <div className="row" id="productBody">
        <div className="tab product__tab">
          <div className={`tablinks ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Mô tả</div>
          <div className={`tablinks ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Bình Luận</div>
          <div className={`tablinks ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Đánh giá</div>
        </div>
        <div id="description_product" className="tabcontent">
          {activeTab === 'description' && (
            <div className="description-content">
              <div className='contentMota' dangerouslySetInnerHTML={{ __html: product.mo_ta }} />              
            </div>
          )}
          {activeTab === 'comments' &&     
            <div>            
              <FacebookSDK />
              <div className="fb-comments" 
                data-href={articleUrl} 
                data-width="100%" 
                data-numposts="5">
              </div>
            </div>       
          }
          {activeTab === 'reviews' && <ReviewForm productId={id} />}
        </div>
      </div>
      <div className="list-productRelated clearfix check-1">
        <div className="heading-title text-center">
          <RelatedProducts />
        </div>
      </div>
    </div>
  );
};

export default ChiTietSanPham;
