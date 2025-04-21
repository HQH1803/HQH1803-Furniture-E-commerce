import React, { useEffect, useState } from 'react';
import '../css/cart.css';
import { useCart } from '../contexts/CartContext'; // Import CartContext
import RelatedProducts from './RelatedProducts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const Cart = () => {
    const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart(); // Get cart and functions from context
    const [totalPrice, setTotalPrice] = useState(0);  // Store total price
    const [totalQuantity, setTotalQuantity] = useState(0); // Store total quantity
    const [stockMessages, setStockMessages] = useState({});  // Store stock messages for each product
    const [isStockAvailable, setIsStockAvailable] = useState(true);  // Flag to track if all items are in stock
    const navigate = useNavigate(); // Initialize navigate hook

    // Update total price whenever the cart changes
    useEffect(() => {
        let newTotalPrice = 0;
        let newTotalQuantity = 0;

        cart.forEach(item => {
            if (stockMessages[item.product_id] !== 'Sản phẩm đã hết hàng.') {
                newTotalPrice += item.gia * item.quantity;
                newTotalQuantity += item.quantity;
            }
        });

        setTotalPrice(newTotalPrice);
        setTotalQuantity(newTotalQuantity);
    }, [cart, stockMessages]);

    // Function to check stock availability for a product
    const checkStock = async (productId, quantity) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/products/stock/${productId}`);
            const { inStock, message, stockQuantity } = response.data;

            if (!inStock) {
                setStockMessages(prev => ({ ...prev, [productId]: message }));
                return false;  // Product is out of stock
            }

            if (quantity > stockQuantity) {
                setStockMessages(prev => ({ ...prev, [productId]: `Chỉ còn ${stockQuantity} sản phẩm trong cửa hàng` }));
                return false;  // Product quantity exceeds stock
            }

            setStockMessages(prev => ({ ...prev, [productId]: '' }));  // Clear the message if stock is enough
            return true;
        } catch (error) {
            console.error('Lỗi kiểm tra tồn kho:', error);
            return false;
        }
    };

    // Increase quantity with stock check
    const handleIncrease = async (productId, quantity) => {
        const isStockAvailable = await checkStock(productId, quantity + 1);
        if (isStockAvailable) {
            increaseQuantity(productId);
        }
    };

    // Decrease quantity with stock check
    const handleDecrease = async (productId, quantity) => {
        const isStockAvailable = await checkStock(productId, quantity - 1);
        if (isStockAvailable) {
            decreaseQuantity(productId);
        }
    };

    // Check if all products in the cart are in stock
    useEffect(() => {
        const checkAllStock = async () => {
            let allInStock = true;
            for (const item of cart) {
                const isStockAvailable = await checkStock(item.product_id, item.quantity);
                if (!isStockAvailable) {
                    allInStock = false;
                    break;
                }
            }
            setIsStockAvailable(allInStock);
        };
        checkAllStock();
    }, [cart]);

    // Prevent checkout if any item is out of stock
    const handleCheckout = () => {
        if (isStockAvailable && totalQuantity <= 5) {
            navigate('/checkout');  // Use navigate to go to the checkout page
        } else if (totalQuantity > 5) {
            alert('Tổng số lượng sản phẩm trong giỏ hàng không được vượt quá 5. Vui lòng kiểm tra lại.');
        } else {
            alert('Một số sản phẩm trong giỏ hàng đã hết hàng. Vui lòng kiểm tra lại.');
        }
    };

    return (
        <div className='container'>
            <div className="row pd_page">
                <div className="col-md-12">
                    <div className="heading-title text-center">
                        <h2>Giỏ hàng của bạn</h2>
                    </div>
                </div>
                <div className="col-md-8 col-xs-12 col-sm-8">
                    <div className="list_form_cart">
                        {cart.length === 0 ? (
                            <div className="expanded_message">
                                <p>Giỏ hàng của bạn đang trống</p>
                            </div>
                        ) : (
                            <div className="list_item_cart">
                                <table className="table-cart">
                                    <tbody>
                                        {cart.map((item, index) => (
                                            <tr className={`line-item-container ${stockMessages[item.product_id] == 'Sản phẩm đã hết hàng.' ? 'out-of-stock' : ''}`} key={index} data-variant-id={item.product_id}>
                                                <td className="image">
                                                    <div className="product_image">
                                                        <a href={`/chitietsanpham/${item.product_id}`}>
                                                            <img src={item.hinh_anh} alt={item.tenSP} />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="item">
                                                    <a href={`/chitietsanpham/${item.product_id}`}>
                                                        <h3>{item.tenSP}</h3>
                                                    </a>
                                                    <p>
                                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia)}</span>
                                                        <del>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia * 1.25)}</del>
                                                    </p>
                                                    <div className="qty quantity-partent qty-click clearfix">
                                                        <button type="button" className="qtyminus qty-btn" onClick={() => handleDecrease(item.product_id, item.quantity)}>-</button>
                                                        <input type="text" size="4" name="updates[]" min="1" value={item.quantity} className="tc line-item-qty item-quantity" />
                                                        <button type="button" className="qtyplus qty-btn" onClick={() => handleIncrease(item.product_id, item.quantity)}>+</button>
                                                    </div>
                                                    <p className="price">
                                                        <span className="text">Thành tiền:</span>
                                                        <span className="line-item-total">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia * item.quantity)}</span>
                                                    </p>
                                                    {stockMessages[item.product_id] && (
                                                        <p className="stock-message">{stockMessages[item.product_id]}</p>
                                                    )}
                                                </td>
                                                <td className="remove">                                                    
                                                    <a type="button" className="cart" onClick={() => removeFromCart(item.product_id)}>
                                                        <i className="bi bi-x-lg"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-4 col-xs-12 col-sm-4 order_cart_fix">
                    <div className="wamper_order_cart">
                        <div className="order_block">
                            <div className="order_title">
                                <h2>Thông tin đơn hàng</h2>
                            </div>
                            <div className="order_total_price">
                                <p>Tổng tiền: <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span></p>
                                <p style={{display:"inline-flex"}}>Tổng số lượng: <span style={{marginLeft: "171px", fontSize: "18px", width: "40px",textAlign:"right"}}>{totalQuantity}</span></p>
                            </div>
                            <div className="order_cart_action">
                                <div className="cart-buttons">
                                    <button
                                        className="checkout-btn"
                                        onClick={handleCheckout}
                                    >
                                        Thanh toán
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a className="countine_order_cart" href="/sanphams/tat-ca-san-pham" title="Tiếp tục mua hàng">
                        <i className="bi bi-reply-fill"></i> Tiếp tục mua hàng
                    </a>
                    <div className="cart_note_new">
                        <p>
                            <i className="bi bi-check-lg"></i>
                            <strong> Không rủi ro. Đặt hàng trước, thanh toán sau tại nhà. Miễn phí giao hàng &amp; lắp đặt</strong> tại tất cả quận huyện thuộc TP.HCM, Hà Nội, Khu đô thị Ecopark, Biên Hòa và một số khu vực thuộc Bình Dương (*)
                        </p>
                        <p>
                            <i className="bi bi-check-lg"></i>
                            <strong> Miễn phí 1 đổi 1 - Bảo hành 2 năm - Bảo trì trọn đời</strong> (**)
                        </p>
                        <p>
                            <i className="bi bi-check-lg"></i>
                            Tất cả sản phẩm được thiết kế bởi các chuyên gia thiết kế nội thất đến từ <strong>Đan Mạch và Hàn Quốc</strong>
                        </p>
                        <p>
                            <i className="bi bi-check-lg"></i>
                            <strong> Chất lượng Quốc Tế đảm bảo theo tiêu chuẩn</strong> cho người dùng tại Việt Nam
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
