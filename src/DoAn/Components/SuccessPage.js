import React from 'react';
import '../css/successpage.css';
import { useLocation, Link } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const { orderDetails} = location.state || {}; // Lấy thông tin đơn hàng từ state

  if (!orderDetails) {
    return <div>Không có thông tin đơn hàng.</div>;
  }

  const { customerInfo, items, orderCode } = orderDetails;
  return (
    <div className="success-container">
      <div className="success-message">
        <h1>Mua Hàng Thành Công</h1>
        <p>Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi.</p>
      </div>

      <div className="order-details">
        <h2>Chi Tiết Đơn Hàng - Mã Đơn Hàng: {orderCode}</h2>
        <div className="customer-info">
          <h3>Thông Tin Khách Hàng</h3>
          <p><strong>Tên khách hàng:</strong> {customerInfo.name}</p>
          <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
          <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
        </div>

        <div className="product-info">
          <h3>Thông Tin Sản Phẩm</h3>
          
          {items.map((item, index) => (
            <div key={index}>
              <p><strong>Tên Sản Phẩm:</strong> {item.product_name}</p>
              <p><strong>Số lượng:</strong> {item.quantity}</p>
              <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="back-to-home">
        <Link to="/" className="btn btn-home">Quay Lại Trang Chủ</Link>
        <Link to="/sanphams/tat-ca-san-pham" className="btn btn-shop-more">Tiếp Tục Mua Hàng</Link> 
      </div>
    </div>
  );
};

export default SuccessPage;
