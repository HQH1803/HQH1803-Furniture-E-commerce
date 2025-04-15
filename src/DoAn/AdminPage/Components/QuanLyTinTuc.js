import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Pagination, DatePicker, Upload, Tooltip,Select } from 'antd';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import ReactQuill from 'react-quill';

const News = () => {
  const [news, setNews] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [fileList, setFileList] = useState([]); // File list state for image uploads

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setVisibleNews(news.slice(startIndex, endIndex));
  }, [currentPage, news]);

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/admin/tin-tuc');
      setNews(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách tin tức');
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentNews(null);
    form.setFieldsValue({
      ngay_dang: null,
      tieu_de: null,     
      noi_dung:null,
      hinh_anh:null,
      luot_xem: null,
      trang_thai: null
  });
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (newsItem) => {
    setIsEditing(true);
    setCurrentNews(newsItem);
    form.setFieldsValue({
      ...newsItem,
      ngay_dang: moment(newsItem.ngay_dang), // Convert date to moment object
    });
    setFileList([{ url: newsItem.hinh_anh }]); // Display current image in file list
    setIsModalVisible(true);
  };

  const handleDelete = async (newsId) => {
    try {
      await axios.delete(`http://localhost:4000/api/admin/tin-tuc/${newsId}`);
      setNews(news.filter(newsItem => newsItem.id !== newsId));
      message.success('Xóa tin tức thành công');
    } catch (error) {
      message.error('Lỗi khi xóa tin tức');
    }
  };

  const showDeleteConfirm = (newsItem) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa tin tức này không?',
      icon: <DeleteOutlined />,
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: () => handleDelete(newsItem.id),
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.hinh_anh = fileList[0]?.url || ''; 
      values.ngay_dang = moment().format('YYYY-MM-DD HH:mm:ss'); 
      if (isEditing) {
        await axios.put(`http://localhost:4000/api/admin/tin-tuc/${currentNews.id}`, values);
        setNews(news.map(newsItem => newsItem.id === currentNews.id ? { ...values, id: currentNews.id } : newsItem));
        message.success('Cập nhật tin tức thành công');
      } else {
        const response = await axios.post('http://localhost:4000/api/admin/tin-tuc', values);
        setNews([...news, response.data]);
        message.success('Thêm tin tức thành công');
        fetchNews();
      }
      setIsModalVisible(false);
    } catch (info) {
      message.error('Có lỗi xảy ra khi lưu tin tức. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFileChange = ({ file, fileList }) => {
    if (file.status === 'done') {
      message.success(`${file.name} tải lên thành công.`);
    } else if (file.status === 'error') {
      message.error(`${file.name} tải lên thất bại.`);
    }
    setFileList(fileList); // Update file list
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tiêu Đề', dataIndex: 'tieu_de', key: 'tieu_de' },   
    { 
      title: 'Hình Ảnh', 
      dataIndex: 'hinh_anh', 
      key: 'hinh_anh',       
      className:"ant-table-cell-img",
      render: (text) => <img src={`${text}`} alt="news"/> 
    },      
    {
      title: 'Ngày Đăng',
      dataIndex: 'ngay_dang',
      key: 'ngay_dang',
      render: (text) => moment(text).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Lượt Xem', // Add views column
      dataIndex: 'luot_xem',
      key: 'luot_xem',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (status) => (
          <span style={{ color: status === 'Đã duyệt' ? 'green' : 'red' }}>
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
      <Button type="primary" onClick={handleAdd} className='btn-Add' icon={<PlusOutlined />}>
        Thêm Tin Tức
      </Button>
      <Table dataSource={visibleNews} columns={columns} rowKey="id" pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={news.length}
        onChange={handlePageChange}
        style={{ marginTop: '16px' }}
      />
      <Modal
        title={isEditing ? 'Sửa Tin Tức' : 'Thêm Tin Tức'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          initialValues={currentNews}
          layout="vertical"
        >
          <Form.Item
            name="tieu_de"
            label="Tiêu Đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="noi_dung" label="Nội Dung" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <ReactQuill
              value={form.getFieldValue('noi_dung')}
              onChange={value => form.setFieldsValue({ noi_dung: value })}
              style={{ height: '200px' }}
            />
          </Form.Item>
          <Form.Item
            name="hinh_anh"
            label="Hình Ảnh"
          >
            <Upload
              action="http://localhost:4000/api/admin/upload"
              listType="picture-card"
              fileList={fileList} // Use fileList state
              onChange={handleFileChange} // Use file change handler
              maxCount={1} // Allow only one image
              customRequest={async ({ file, onSuccess, onError }) => {
                const formData = new FormData();
                formData.append('file', file);
                try {
                  const response = await fetch('http://localhost:4000/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  if (!response.ok) {
                    throw new Error('Upload failed');
                  }
                  const result = await response.json();
                  file.url = `http://localhost:4000${result.url}`; // Get image URL
                  onSuccess(result);
                } catch (error) {
                  onError(error);
                }
              }}
            >
              {fileList.length > 0 ? null : uploadButton}
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="trang_thai"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Chưa duyệt">Chưa duyệt</Select.Option>
              <Select.Option value="Đã duyệt">Đã duyệt</Select.Option>
            </Select>
          </Form.Item>

         
        </Form>
      </Modal>
    </div>
  );
};

export default News;
