import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import '../css/orderlist.css'; // Import CSS file for styling
import Pagination from './Pagination'; // Import the new Pagination component
import axios from 'axios';
const OrderList = () => {
    const [orders, setOrders] = useState([]); // State for the list of orders
    const [selectedOrder, setSelectedOrder] = useState(null); // State for the currently selected order to view details
    const [orderDetails, setOrderDetails] = useState([]); // State for the details of the selected order
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [currentPage, setCurrentPage] = useState(1); // Pagination: current page
    const [ordersPerPage] = useState(3); // Number of orders per page
    const [filter, setFilter] = useState(''); // Filter for order status
    const [sortOption, setSortOption] = useState(''); // Sorting option

    const [provinces, setProvinces] = useState({});
    const [districts, setDistricts] = useState({});
    const [wards, setWards] = useState({})
   
    const { customerUser} = useUser(); 

   

    useEffect(() => {        
        const fetchOrders = async () => {               
            const email = customerUser?.email
            if (!customerUser) {
                return <p>Loading...</p>;
            } 
            try {
                const response = await fetch(`http://localhost:4000/api/don-hang-user?email=${email}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);
    

    // Fetch details of a specific order
    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/don-hang/${orderId}/details`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            const data = await response.json();
            setOrderDetails(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle viewing the details of an order
    const handleViewDetails = (order) => {
        if (selectedOrder && selectedOrder.order_id === order.order_id) {
            setSelectedOrder(null); // Deselect order if the same order is clicked again
        } else {
            setSelectedOrder(order);
            fetchOrderDetails(order.order_id); // Fetch details for the selected order
        }
    };

    // Handle canceling an order
    const handleCancelOrder = async (order) => {
        if (order.status !== 'ready_to_pick') {
            alert('Không thể hủy đơn hàng đang ở trạng thái này');
            return;
        }
    
        const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng mã ${order.order_code}?`);
        
        if (!confirmCancel) {
            return; // Exit if user cancels the action
        }
    
        try {
            const response = await fetch(`http://localhost:4000/api/don-hang/${order.order_id}/cancel`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to cancel order');
            }
            alert(result.message);
    
            // Update the order status in the list
            setOrders(orders.map(o => o.order_id === order.order_id ? { ...o, status: 'cancel' } : o));
        } catch (error) {
            alert('Có lỗi xảy ra khi hủy đơn hàng: ' + error.message);
        }
    };

    // Filter and sort orders based on status and sorting option
    const filteredOrders = filter
        ? orders.filter(order => order.status && order.status.toLowerCase() === filter.toLowerCase())
        : orders;


    // Apply sorting logic based on selected sort option
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortOption === 'Mới') {
            return new Date(b.created_at) - new Date(a.created_at); // Newest orders first
        } else if (sortOption === 'Cũ nhất') {
            return new Date(a.created_at) - new Date(b.created_at); // Oldest orders first
        }
        return 0; // Default: no sorting
    });

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);



     useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Token': process.env.REACT_APP_API_TOKEN_GHN
                    }
                });
                const data = await response.json();
                if (data.code === 200) {
                    const provinceMap = data.data.reduce((acc, province) => {
                        acc[province.ProvinceID] = province.ProvinceName;
                        return acc;
                    }, {});
                    setProvinces(provinceMap);
                }
            } catch (err) {
                console.error("Failed to fetch provinces:", err);
            }
        };
    
        fetchProvinces();
    }, []);

    
    useEffect(() => {
        const fetchDistricts = async () => {
            try {                
                const response = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Token': process.env.REACT_APP_API_TOKEN_GHN
                    },
                    body: JSON.stringify({})                    
                });
                const data = await response.json();
                if (data.code === 200) {
                    const districtMap = data.data.reduce((acc, district) => {
                        acc[district.DistrictID] = {
                            name: district.DistrictName,
                            provinceId: district.ProvinceID,  // Thêm mã tỉnh
                        };
                        return acc;
                    }, {});
                    setDistricts(districtMap);
                }
            } catch (err) {
                console.error("Failed to fetch districts:", err);
            }
        };   
        // Lấy danh sách phường cho từng quận
        const fetchWardsForDistricts = async () => {
            const districtIds = [...new Set(currentOrders.map(order => order.recipient_district))]; // Lấy danh sách mã quận duy nhất
            
            for (const districtId of districtIds) {
                try {
                    const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`, {
                        headers: {
                            'token': process.env.REACT_APP_API_TOKEN_GHN,
                            'Content-Type': 'application/json'
                        }
                    });

                    const wardData = response.data.data;
                    const wardMap = {};
                    wardData.forEach(ward => {
                        wardMap[ward.WardCode] = ward.WardName;
                    });
                    setWards(prev => ({ ...prev, [districtId]: wardMap }));
                } catch (error) {
                    console.error(`Error fetching wards for district ${districtId}:`, error);
                }
            }
        };

        fetchDistricts();
        fetchWardsForDistricts();
    }, [currentOrders]);

    // Pagination handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    return (
        <>
        {!customerUser ? (
            <div>
                <p>Vui lòng đăng nhập để xem danh sách đơn hàng.</p>
                <a href="/login">Đăng nhập</a>
            </div>
        ) : (
            <div className="order-container">
                <div className="order-list">
                    <h2>Danh Sách Đơn Đặt Hàng</h2>
                    <div className="filter-bar">
                        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                            <option value="">Tất cả</option>
                            <option value="ready_to_pick">Đơn hàng vừa được tạo</option>
                            <option value="picking">Shipper đang lấy hàng</option>
                            <option value="delivering">Đang giao hàng</option>
                            <option value="delivered">Đơn hàng đã giao</option>
                            <option value="cancel">Đơn hàng đã bị hủy</option>
                        </select>
                        <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                            <option value="">Sắp xếp</option>
                            <option value="Mới">Đơn hàng mới</option>
                            <option value="Cũ nhất">Cũ nhất</option>
                        </select>
                    </div>
        
                    {/* Check if there are no orders */}
                    {currentOrders.length === 0 ? (
                        <div className="empty-order-list">
                            <p>Danh sách đơn hàng rỗng.</p>
                            <a href="/sanphams/tat-ca-san-pham" title="Xem tất cả sản phẩm">
                                <i className="icon"></i> Xem tất cả sản phẩm
                            </a>
                        </div>
                    ) : (
                        <ul>
                            {currentOrders.map(order => (
                                <li className="order-item" key={order.order_id}>
                                    <div className="order-info">
                                        <p><strong>Mã Đơn Hàng:</strong> {order.order_code}</p>
                                        <p><strong>Tên Người Nhận:</strong> {order.recipient_name}</p>
                                        <p><strong>Số Điện Thoại:</strong> {order.recipient_phone}</p>
                                        <p>
                                            <strong>Địa Chỉ: </strong> 
                                            {order.recipient_address},&nbsp;  
                                            {wards[order.recipient_district]?.[order.recipient_ward] || order.recipient_ward},&nbsp;   
                                            {districts[order.recipient_district]?.name || order.recipient_district},&nbsp; 
                                            {provinces[districts[order.recipient_district]?.provinceId] || "Unknown Province"}
                                        </p>
                                        <p><strong>Ngày Đặt:</strong> {new Date(order.created_at).toLocaleString()}</p>
                                        <p><strong>Tổng Tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</p>
                                        <p><strong>Trạng Thái: </strong> 
                                            {order.status === 'ready_to_pick' && 'Đơn hàng vừa được tạo'}
                                            {order.status === 'picking' && 'Shipper đang lấy hàng'}
                                            {order.status === 'delivering' && 'Đang giao hàng'}
                                            {order.status === 'delivered' && 'Đơn hàng đã giao'}
                                            {order.status === 'cancel' && 'Đơn hàng đã bị hủy'}
                                        </p>
                                    </div>
                                    <div className="order-actions">
                                        <button
                                            className="details-btn"
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            {selectedOrder && selectedOrder.order_id === order.order_id ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết'}
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancelOrder(order)}
                                        >
                                            Hủy Đơn Hàng
                                        </button>
                                    </div>
                                    {selectedOrder && selectedOrder.order_id === order.order_id && (
                                        <div className="order-details">
                                            {orderDetails.length > 0 ? (
                                                <ul>
                                                    {orderDetails.map((item, index) => (
                                                        <li key={index}>
                                                            <p><strong>Sản Phẩm:</strong> {item.product_name}</p>
                                                            <p><strong>Số Lượng:</strong> {item.quantity}</p>
                                                            <p><strong>Đơn Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                                                            <p><strong>Tổng Tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.tong_tien)}</p>
                                                            <hr />
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>Không có chi tiết cho đơn hàng này.</p>
                                            )}
                                        </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* New Pagination */}
                        {currentOrders.length > 0 && (
                            <Pagination
                                productsPerPage={ordersPerPage}
                                totalProducts={sortedOrders.length}
                                paginate={paginate}
                                currentPage={currentPage}
                            />
                        )}
                        </div>
                </div>
        )}
    </>
    )
    
};

export default OrderList;
