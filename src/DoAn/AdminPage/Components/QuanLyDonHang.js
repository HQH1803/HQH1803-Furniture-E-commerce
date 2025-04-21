import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, message, Pagination } from 'antd';
import axios from 'axios';
import { DeleteOutlined,EyeOutlined } from '@ant-design/icons';
import moment from 'moment';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [visibleOrders, setVisibleOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [provinces, setProvinces] = useState({});
  const [districts, setDistricts] = useState({});
  const [wards, setWards] = useState({});
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setVisibleOrders(orders.slice(startIndex, endIndex));
  }, [currentPage, orders]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
          headers: {
            'Token': process.env.REACT_APP_API_TOKEN_GHN,
          },
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
        console.error('Failed to fetch provinces:', err);
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
            'Token': process.env.REACT_APP_API_TOKEN_GHN,
          },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        if (data.code === 200) {
          const districtMap = data.data.reduce((acc, district) => {
            acc[district.DistrictID] = {
              name: district.DistrictName,
              provinceId: district.ProvinceID, // Lưu mã tỉnh
            };
            return acc;
          }, {});
          setDistricts(districtMap);
        }
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      }
    };
    const fetchWardsForDistricts = async () => {
      
      const districtIds = [...new Set(orders.map(order => order.recipient_district))];
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
              setWards(prev => ({ ...prev, [districtId]: {} }));
          }
      }
  };

  fetchDistricts();
  fetchWardsForDistricts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_BASE_URL}/don-hang');
      setOrders(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách đơn hàng');
    }
  };
    
  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/don-hang/${orderId}`);
      setOrders(orders.filter((order) => order.order_id !== orderId));
      message.success('Xóa đơn hàng thành công');
    } catch (error) {
      message.error('Lỗi khi xóa đơn hàng');
    }
  };

  const showDeleteConfirm = (order) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa đơn hàng này không?',
      icon: <DeleteOutlined />,
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: () => handleDelete(order.order_id),
    });
  };
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/don-hang/${orderId}/details`);
      setOrderDetails(response.data);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi lấy chi tiết đơn hàng');
    }
  };
  

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { title: 'ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Mã Đơn Hàng', dataIndex: 'order_code', key: 'order_code' },
    { title: 'Tên Người Nhận', dataIndex: 'recipient_name', key: 'recipient_name' },
    { title: 'SĐT Người Nhận', dataIndex: 'recipient_phone', key: 'recipient_phone' },
    { title: 'Địa Chỉ', dataIndex: 'recipient_address', key: 'recipient_address' },
    {
      title: 'Phường/Xã',
      dataIndex: 'recipient_ward',
      key: 'recipient_ward',
      render: (wardCode, record) => wards[record.recipient_district]?.[record.recipient_ward] || record.recipient_ward || 'Unknown Ward'
    },
    {
      title: 'Quận/Huyện',
      dataIndex: 'recipient_district',
      key: 'recipient_district',
      render: (districtId) => districts[districtId]?.name || districtId,
    },
    {
      title: 'Tỉnh/Thành Phố',
      dataIndex: 'recipient_district',
      key: 'province',
      render: (districtId) => {
        const provinceId = districts[districtId]?.provinceId;
        return provinces[provinceId] || provinceId;
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        switch (status) {
          case 'ready_to_pick':
            return 'Đơn hàng vừa được tạo';
          case 'picking':
            return 'Shipper đang lấy hàng';
          case 'delivering':
            return 'Đang giao hàng';
          case 'delivered':
            return 'Đơn hàng đã giao';
          case 'cancel':
            return 'Đơn hàng đã bị hủy';
          default:
            return 'Trạng thái không xác định';
        }
      },
    },
    
    {
      title: 'Tổng Tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, record) => (
        <div style={{ textAlign: 'center', display:'flex' }}>          
          <Button 
            style={{ marginRight: '8px' }}
            onClick={() => fetchOrderDetails(record.order_id)}
            icon={<EyeOutlined />}
          >
          </Button>
          <Button
            onClick={() => showDeleteConfirm(record)}
            type="primary"
            danger
            icon={<DeleteOutlined />}            
          />
        </div>
      ),
    }
  ];

  return (
    <div>
      <Table dataSource={visibleOrders} columns={columns} rowKey="order_id" pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={orders.length}
        onChange={handlePageChange}
        style={{ marginTop: '16px' }}
      />
      <Modal
        title="Chi Tiết Đơn Hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
        footer={null}
      >
        <Table
          dataSource={orderDetails}
          columns={[
            { title: 'ID Sản Phẩm', dataIndex: 'product_id', key: 'product_id' },
            { title: 'Tên Sản Phẩm', dataIndex: 'product_name', key: 'product_name' },
            { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
            {
              title: 'Giá',
              dataIndex: 'price',
              key: 'price',
              render: (text) =>
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text),
            },
            {
              title: 'Tổng Tiền',
              dataIndex: 'tong_tien',
              key: 'tong_tien',
              render: (text) =>
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text),
            },
          ]}
          rowKey="item_id"
      />
      </Modal>


    </div>
  );
};

export default Orders;
