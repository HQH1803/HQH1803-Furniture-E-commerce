import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Pagination, DatePicker, Select } from 'antd';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [visiblePromotions, setVisiblePromotions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setVisiblePromotions(promotions.slice(startIndex, endIndex));
  }, [currentPage, promotions]);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/admin/promotions');
      setPromotions(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách khuyến mãi');
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentPromotion(null);    
    form.setFieldsValue({
        start_date: null,
        end_date: null,     
        code: null,
        description: null,
        discount:null,
        status:null
    });
    setIsModalVisible(true);
};


  const handleEdit = (promotionItem) => {
    setIsEditing(true);
    setCurrentPromotion(promotionItem);
    form.setFieldsValue({
      ...promotionItem,
      start_date: moment(promotionItem.start_date),
      end_date: moment(promotionItem.end_date), 
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (promotionId) => {
    try {
      await axios.delete(`http://localhost:4000/api/admin/promotions/${promotionId}`);
      setPromotions(promotions.filter(promotionItem => promotionItem.id !== promotionId));
      message.success('Xóa khuyến mãi thành công');
    } catch (error) {
      message.error('Lỗi khi xóa khuyến mãi');
    }
  };

  const showDeleteConfirm = (promotionItem) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa khuyến mãi này không?',
      icon: <DeleteOutlined />,
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: () => handleDelete(promotionItem.id),
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.start_date = values.start_date.format('YYYY-MM-DD HH:mm:ss');
      values.end_date = values.end_date.format('YYYY-MM-DD HH:mm:ss');

      if (new Date(values.end_date) < new Date(values.start_date)) {
        return message.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      }

      if (isEditing) {
        await axios.put(`http://localhost:4000/api/admin/promotions/${currentPromotion.id}`, values);
        setPromotions(promotions.map(promotionItem => 
          promotionItem.id === currentPromotion.id ? { ...values, id: currentPromotion.id } : promotionItem
        ));
        message.success('Cập nhật khuyến mãi thành công');
      } else {
        const response = await axios.post('http://localhost:4000/api/admin/promotions', values);
        setPromotions([...promotions, response.data]);
        message.success('Thêm khuyến mãi thành công');
        fetchPromotions();
      }
      
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Mã Khuyến Mãi', dataIndex: 'code', key: 'code' },
    { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
    { title: 'Giảm Giá (%)', dataIndex: 'discount', key: 'discount' },
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (text) => moment(text).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Ngày Kết Thúc',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text) => moment(text).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'active' ? 'green' : 'red' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'inline-flex' }}>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }} icon={<EditOutlined />} />
          <Button onClick={() => showDeleteConfirm(record)} type="primary" danger icon={<DeleteOutlined />} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleAdd} className="btn-Add" icon={<PlusOutlined />}>
        Thêm Khuyến Mãi
      </Button>
      <Table dataSource={visiblePromotions} columns={columns} rowKey="id" pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={promotions.length}
        onChange={handlePageChange}
        style={{ marginTop: '16px' }}
      />
      <Modal
        title={isEditing ? 'Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} initialValues={currentPromotion} layout="vertical">
          <Form.Item
            name="code"
            label="Mã Khuyến Mãi"
            rules={[{ required: true, message: 'Vui lòng nhập mã khuyến mãi!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả khuyến mãi!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="discount"
            label="Giảm Giá (%)"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm giá!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Ngày Bắt Đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="Ngày Kết Thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Active">active</Select.Option>
              <Select.Option value="Inactive">inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Promotions;
