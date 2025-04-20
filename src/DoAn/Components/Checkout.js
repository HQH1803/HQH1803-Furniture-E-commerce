import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import '../css/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { product, isBuyNow } = location.state || {}; // Nhận sản phẩm từ state
  console.log(product)
  const { cart, clearCart } = useCart();
  const { customerUser} = useUser();  // Access both admin and customer users from UserContext

  
  const [totalPrice, setTotalPrice] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [serviceId, setServiceId] = useState(null);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(''); // Payment method state
  const [errors, setErrors] = useState({});

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  

  const API_KEY = process.env.REACT_APP_API_TOKEN_GHN;

  useEffect(() => {
    const newTotalPrice = cart.reduce((total, item) => total + item.gia * item.quantity, 0);
    setTotalPrice(newTotalPrice);
  }, [cart]);


  useEffect(() => {
    if (customerUser) {
        setRecipientName(customerUser.ho_ten || '');
        setRecipientPhone(customerUser.sdt || '');
    }
  }, [customerUser]);

  const validateRecipientName = (value) => {
    if (!value) {
        setErrors(prevErrors => ({ ...prevErrors, recipientName: 'Tên người nhận không được để trống.' }));
    } else {
        setErrors(prevErrors => ({ ...prevErrors, recipientName: undefined }));
    }
};

  const validateRecipientPhone = (value) => {
      const phoneRegex = /^(0[0-9]{9})$/; // Kiểm tra định dạng số điện thoại
      if (!value) {
          setErrors(prevErrors => ({ ...prevErrors, recipientPhone: 'Số điện thoại không được để trống.' }));
      } else if (!phoneRegex.test(value)) {
          setErrors(prevErrors => ({ ...prevErrors, recipientPhone: 'Số điện thoại không hợp lệ.' }));
      } else {
          setErrors(prevErrors => ({ ...prevErrors, recipientPhone: undefined }));
      }
  };

  const validateRecipientAddress = (value) => {
      if (!value) {
          setErrors(prevErrors => ({ ...prevErrors, recipientAddress: 'Địa chỉ không được để trống.' }));
      } else {
          setErrors(prevErrors => ({ ...prevErrors, recipientAddress: undefined }));
      }
  };

  const handleNameChange = (e) => {
      const value = e.target.value;
      setRecipientName(value);
      validateRecipientName(value);
  };

  const handlePhoneChange = (e) => {
      const value = e.target.value;
      setRecipientPhone(value);
      validateRecipientPhone(value);
  };

  const handleAddressChange = (e) => {
      const value = e.target.value;
      setRecipientAddress(value);
      validateRecipientAddress(value);
  };
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
          headers: { 'Token': API_KEY }
        });
        setProvinces(response.data.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, [API_KEY]);

  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${selectedProvince}`, {
            headers: { 'Token': API_KEY }
          });
          setDistricts(response.data.data);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${selectedDistrict}`, {
            headers: { 'Token': API_KEY }
          });
          setWards(response.data.data);
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDistrict && selectedProvince) {
      const fetchShippingServices = async () => {
        try {
          const response = await axios.post(
            'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services', 
            {
              shop_id: 5400846,
              from_district: 1461, // Mã quận gửi đi (đảm bảo đúng)
              to_district: parseInt(selectedDistrict) // Mã quận người nhận (đã chọn)
            }, 
            {
              headers: { 'Token': API_KEY }
            }
          );
  
          if (response.data.data && response.data.data.length > 0) {
            setServiceId(response.data.data[0].service_id); // Gán service_id tự động
          } else {
            console.warn("No services found for the given district");
          }
  
        } catch (error) {
          console.error('Error fetching shipping services:', error.message);
        }
      };
  
      fetchShippingServices();
    }
  }, [selectedProvince, selectedDistrict]);
    // Tự động tính phí vận chuyển khi có đủ tỉnh, quận và phường
    useEffect(() => {
      if (selectedProvince && selectedDistrict && selectedWard && serviceId) {
        calculateShippingFee();
      }
    }, [selectedProvince, selectedDistrict, selectedWard, serviceId]);
  const calculateShippingFee = async () => {
    setLoading(true);
    try {
      const data = {
        service_id:serviceId,
        insurance_value: 0,
        coupon: null,
        from_district_id: 1461, // Replace with actual from district ID
        to_district_id: parseInt(selectedDistrict),
        to_ward_code: selectedWard,
        height: 10,  // Replace with actual height from cart
        length: 20,  // Replace with actual length from cart
        weight: 10000, // Replace with actual weight from cart
        width: 10,   // Replace with actual width from cart
      };

      const response = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', data, {
        headers: {
          'Content-Type': 'application/json',
          'ShopId': 5400846, // Replace with your shop ID
          'Token': API_KEY, // Replace with your API token
        },
      });

      setShippingFee(response.data.data.total);
    } catch (error) {
      setErrorMessage('Không thể tính phí vận chuyển. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const calculateTotalPrice = () => {
    // Kiểm tra cart có dữ liệu hay không
    if (cart.length === 0) {
      setTotalPrice(0);
      return;
    }
    
    // Tính tổng giá trị giỏ hàng
    const cartTotal = cart.reduce((acc, item) => acc + (item.gia * item.quantity || 0), 0);
    
    // Nếu có giảm giá, tính giảm giá, nếu không giảm giá = 0
    const discountAmount = (cartTotal * (discount || 0)) / 100;
  
    // Tính toán tổng giá trị sau khi áp dụng giảm giá và phí vận chuyển
    const totalPrice = cartTotal + (shippingFee || 0) - discountAmount;
  
    // Cập nhật giá trị tổng vào state
    setTotalPrice(totalPrice);
  };
  
  useEffect(() => {
    calculateTotalPrice();
  }, [shippingFee, cart, discount]);  // Thêm discount vào dependency nếu cần
  



  // Handle online payment
  const handleOnlinePayment = async () => {    
    if ( recipientName==null || recipientPhone==null || recipientAddress==null || selectedWard==null || !serviceId) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin người nhận và địa chỉ.');
      return;
    }
    if (recipientPhone.length < 10) {
      setErrorMessage('Số điện thoại không hợp lệ');
      return;
    }
    if (!customerUser) {
      setErrorMessage('Bạn cần đăng nhập để đặt hàng.');
      return;
  }
    setLoading(true);
    const totalWeight = isBuyNow ? (10000): cart.reduce((total, item) => total + (10000* item.quantity), 0);
    if (totalWeight > 50000) {
      alert('Trọng lượng đơn hàng vượt quá giới hạn cho phép. Vui lòng giảm trọng lượng hoặc chia đơn hàng.');
      setLoading(false);
      return;
    }
    const orderData = {
      payment_type_id: 2, // Example
      note: 'Some note',
      required_note: 'CHOTHUHANG',
      from_name: 'Nội Thất Tinie',
      from_phone: '0336657490',
      from_address: 'Phạm Văn Chiêu',
      from_ward_name: 'Phường 9',
      from_district_name: 'Quận Gò Vấp',
      from_province_name: 'Hồ Chí Minh',
      return_phone: '0336657490',
      return_address: 'Return Address',
      to_name: recipientName,
      to_phone: recipientPhone,
      to_address: recipientAddress,
      to_ward_code: selectedWard,
      to_district_id: selectedDistrict,
      total_price: totalPrice,
      weight: totalWeight,
      length: 20,
      width: 30,
      height: 40,
      service_id: serviceId, // Use the assigned service_id
      user_email: customerUser.email,
      items: isBuyNow ? [{
        name: product.tenSP, // Tên sản phẩm
        productId: product.id, // ID sản phẩm
        quantity: 1, // Số lượng sản phẩm
        price: parseInt(product.gia, 10), // Giá sản phẩm
        length: 12, // Chiều dài sản phẩm (cm)
        width: 12, // Chiều rộng sản phẩm (cm)
        height: 12, // Chiều cao sản phẩm (cm)
        weight: 10000 // Trọng lượng sản phẩm (g)
    }] : cart.map(item => ({
        name: item.tenSP, // Tên sản phẩm
        productId: item.id, // ID sản phẩm
        quantity: item.quantity, // Số lượng sản phẩm
        price: parseInt(item.gia, 10), // Giá sản phẩm
        length: 12, // Chiều dài sản phẩm (cm)
        width: 12, // Chiều rộng sản phẩm (cm)
        height: 12, // Chiều cao sản phẩm (cm)
        weight: 10000 // Trọng lượng sản phẩm (g)
    }))
    };
    const totalAll = isBuyNow ? (parseInt(product.gia) + shippingFee): totalPrice
    try {
        
        const paymentResponse = await axios.post('http://furniture-e-commerce-wt2i.onrender.com/payment', {totalAll});

        if (paymentResponse.data.return_code === 1) {
            const appTransId = paymentResponse.data.app_trans_id;
            const orderUrl = paymentResponse.data.order_url;

            const paymentWindow = window.open(orderUrl, '_blank');

            const intervalId = setInterval(async () => {
                const statusResponse = await axios.post('http://furniture-e-commerce-wt2i.onrender.com/check-status-order', {
                    app_trans_id: appTransId 
                });
                
                if (statusResponse.data.return_code === 1) {
                  const orderResponse = await axios.post('http://furniture-e-commerce-wt2i.onrender.com/api/create-order', orderData);
                    if (orderResponse.data.message === 'Success') {
                      
                        const orderCode = orderResponse.data.order_code;

                        const orderDetails = {
                            orderCode,
                            customerInfo: {
                                name: recipientName,
                                phone: recipientPhone,
                                address: recipientAddress,
                            },
                            items: isBuyNow ? {
                              product_name: product.tenSP,
                              quantity: product.quantity,
                              price: parseInt(product.gia, 10),
                            }:cart.map(item => ({
                                product_name: item.tenSP,
                                quantity: item.quantity,
                                price: parseInt(item.gia, 10),
                            })),
                        };

                        clearCart();
                        navigate('/successpage', { state: { orderDetails } });
                         // Đóng cửa sổ thanh toán
                        
                    }
                    if (paymentWindow) {
                      paymentWindow.close(); // Đóng cửa sổ đã mở
                    }
                    else {
                        console.error('Order creation failed:', orderResponse.data);
                        alert('Failed to create the order. Please try again.');
                    }

                    clearInterval(intervalId);
                } else if (statusResponse.data.return_code === 3) {
                    console.log(statusResponse.data.return_message);
                } else if (statusResponse.data.return_code === 2) {
                    console.error('Payment failed:', statusResponse.data);
                    alert('Payment was not successful. Please try again.');
                    if (paymentWindow) paymentWindow.close();
                    clearInterval(intervalId);
                }
            }, 5000);
        } else {
           setErrorMessage('Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng kiểm tra lại thông tin', paymentResponse.data.message);
        }
    } catch (error) {
       setErrorMessage('Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng kiểm tra lại thông tin');
    } finally {
        setLoading(false);
    }
};

  
  // Xử lý thanh toán Thanh toán 
  const handlePlaceOrder = async () => {
    if ( recipientName==null || recipientPhone==null || recipientAddress==null || selectedWard==null || !serviceId) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin người nhận và địa chỉ.');
      return;
    }
    if (recipientPhone.length < 10) {
      setErrorMessage('Số điện thoại không hợp lệ');
      return;
    }
    if (!customerUser) {
      setErrorMessage('Bạn cần đăng nhập để đặt hàng.');
      return;
  }
    setLoading(true);
    const totalWeight = isBuyNow ? (10000): cart.reduce((total, item) => total + (10000* item.quantity), 0);
    if (totalWeight > 50000) {
      alert('Trọng lượng đơn hàng vượt quá giới hạn cho phép. Vui lòng giảm trọng lượng hoặc chia đơn hàng.');
      setLoading(false);
      return;
    }
    const orderData = {
      payment_type_id: 2, // Example
      note: 'Some note',
      required_note: 'CHOTHUHANG',
      from_name: 'Nội Thất Tinie',
      from_phone: '0336657490',
      from_address: 'Phạm Văn Chiêu',
      from_ward_name: 'Phường 9',
      from_district_name: 'Quận Gò Vấp',
      from_province_name: 'Hồ Chí Minh',
      return_phone: '0336657490',
      return_address: 'Return Address',
      to_name: recipientName,
      to_phone: recipientPhone,
      to_address: recipientAddress,
      to_ward_code: selectedWard,
      to_district_id: selectedDistrict,
      total_price: totalPrice,
      weight: totalWeight,
      length: 20,
      width: 30,
      height: 40,
      service_id: serviceId, // Use the assigned service_id
      user_email: customerUser.email,
      items: isBuyNow ? [{
        name: product.tenSP, // Tên sản phẩm
        productId: product.id, // ID sản phẩm
        quantity: product.soluong, // Số lượng sản phẩm
        price: parseInt(product.gia, 10), // Giá sản phẩm
        length: 12, // Chiều dài sản phẩm (cm)
        width: 12, // Chiều rộng sản phẩm (cm)
        height: 12, // Chiều cao sản phẩm (cm)
        weight: 10000 // Trọng lượng sản phẩm (g)
    }] : cart.map(item => ({
        name: item.tenSP, // Tên sản phẩm
        productId: item.id, // ID sản phẩm
        quantity: item.quantity, // Số lượng sản phẩm
        price: parseInt(item.gia, 10), // Giá sản phẩm
        length: 12, // Chiều dài sản phẩm (cm)
        width: 12, // Chiều rộng sản phẩm (cm)
        height: 12, // Chiều cao sản phẩm (cm)
        weight: 10000 // Trọng lượng sản phẩm (g)
    }))
    };

    try {
      const response = await axios.post('http://furniture-e-commerce-wt2i.onrender.com/api/create-order', orderData);
    
      // Log toàn bộ phản hồi từ API để kiểm tra
      console.log('API Response:', response.data);
    
      // Kiểm tra nếu message là "Success"
      if (response.data.message === 'Success') {
        const orderCode = response.data.order_code; // Lấy order_code từ response
  
        // Cấu trúc thông tin đơn hàng chi tiết
        const orderDetails = {
          orderCode,
          customerInfo: {
            name: recipientName,
            phone: recipientPhone,
            address: recipientAddress,
          },
          items: isBuyNow ? {
            product_name: product.tenSP,
            quantity:product.soluong,
            price: parseInt(product.gia, 10),
          }:cart.map(item => ({
            product_name: item.tenSP,
            quantity: item.quantity,
            price: parseInt(item.gia, 10),
          }))
        };
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
        navigate('/successpage', { state: { orderDetails} });  // Chuyển hướng đến trang thành công
      } else {
        setErrorMessage('Đặt hàng thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessage('Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }    
  };

  const applyPromoCode = async (e) => {
    const promoCode = e.target.value;
    setPromoCode(promoCode); // Cập nhật giá trị mã khuyến mãi
  
    if (!promoCode) {
      setDiscount(0);
      setErrorMessage('');
      return;
    }
  
    try {
      const response = await axios.post('http://furniture-e-commerce-wt2i.onrender.com/api/promotions', { code: promoCode });
      if (response.data.success) {
        const { discount } = response.data;
        setDiscount(discount);  // Áp dụng giảm giá nếu mã hợp lệ
        setErrorMessage(''); // Clear any previous error message
      } else {
        setErrorMessage('Mã không hợp lệ. Vui lòng thử lại');
        setDiscount(0); // Đặt giảm giá về 0 nếu mã không hợp lệ
      }
    } catch (error) {
      setErrorMessage('Error applying promo code');
      console.error('Error applying promo code:', error);
      setDiscount(0);  // Đặt giảm giá về 0 nếu có lỗi trong quá trình áp dụng mã
    }
  };
  
  
  
  return (
    <div className="checkout">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
  
        <div className="row checkout-container">
        <div className="col-sm-6 checkout-form">
            <input 
                type="text"
                placeholder="Tên người nhận"
                value={recipientName}
                onChange={handleNameChange}
                required
            />
            {errors.recipientName && <p style={{ color: 'red' }}>{errors.recipientName}</p>}

            <input 
                type="tel"
                placeholder="Số điện thoại người nhận"
                value={recipientPhone}
                onChange={handlePhoneChange}
                required
            />
            {errors.recipientPhone && <p style={{ color: 'red' }}>{errors.recipientPhone}</p>}

            <select onChange={(e) => setSelectedProvince(e.target.value)} value={selectedProvince}>
                <option value="">Chọn tỉnh thành</option>
                {provinces.map((province) => (
                    <option key={province.ProvinceID} value={province.ProvinceID}>{province.ProvinceName}</option>
                ))}
            </select>
            {selectedProvince === '' && <p style={{ color: 'red' }}>Bạn phải chọn tỉnh thành.</p>}

            <select onChange={(e) => setSelectedDistrict(e.target.value)} value={selectedDistrict}>
                <option value="">Chọn quận huyện</option>
                {districts.map((district) => (
                    <option key={district.DistrictID} value={district.DistrictID}>{district.DistrictName}</option>
                ))}
            </select>
            {selectedDistrict === '' && <p style={{ color: 'red' }}>Bạn phải chọn quận huyện.</p>}

            <select onChange={(e) => setSelectedWard(e.target.value)} value={selectedWard}>
                <option value="">Chọn phường xã</option>
                {wards.map((ward) => (
                    <option key={ward.WardCode} value={ward.WardCode}>{ward.WardName}</option>
                ))}
            </select>
            {selectedWard === '' && <p style={{ color: 'red' }}>Bạn phải chọn phường xã.</p>}

            <input
                type="text"
                placeholder="Địa chỉ người nhận"
                value={recipientAddress}
                onChange={handleAddressChange}
                required
            />
            {errors.recipientAddress && <p style={{ color: 'red' }}>{errors.recipientAddress}</p>}

            <select onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                <option value="">Chọn phương thức thanh toán</option>
                <option value="COD">Thanh toán khi nhận hàng</option>
                <option value="ONLINE">Thanh toán trực tuyến</option>
            </select>
            {paymentMethod === '' && <p style={{ color: 'red' }}>Bạn phải chọn phương thức thanh toán.</p>}
        </div>
  
        <div className="col-sm-6 checkout-summary">
          <h2>Giỏ hàng của bạn</h2>
          {isBuyNow ? (
        <div className="cart-item">
          <img src={product.hinh_anh} alt={product.tenSP} className="cart-item-image" />
          <div className="cart-item-details">
            <p>{product.tenSP}</p>
            <p>Số lượng: 1</p> {/* Mặc định số lượng là 1 */}
            <p>Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}</p>
          </div>
        </div>
      ) : (
        cart.map(item => (
          <div className="cart-item" key={item.id}>
            <img src={item.hinh_anh} alt={item.tenSP} className="cart-item-image" />
            <div className="cart-item-details">
              <p>{item.tenSP}</p>
              <p>Số lượng: {item.quantity}</p>
              <p>Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia)}</p>
            </div>
          </div>
        ))
      )}
      <div>
        <label htmlFor="promoCode">Mã giảm giá:</label>
        <input
          type="text"
          id="promoCode"
          value={promoCode}
          onChange={applyPromoCode} // Kiểm tra mã mỗi khi người dùng nhập
          placeholder="Nhập mã giảm giá tại đây"
        />


      </div>

      <h3>Phí vận chuyển: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</h3>
      <h3>Giảm giá: {Math.round(discount)}%</h3>
      <h3>Tổng cộng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isBuyNow ? (parseInt(product.gia)+shippingFee): totalPrice)}</h3>
      
          {paymentMethod === 'ONLINE' ? (
            <button className='place-order-btn' onClick={handleOnlinePayment} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Thanh toán trực tuyến'}
            </button>
          ) : (
            <button className='place-order-btn' onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Checkout;