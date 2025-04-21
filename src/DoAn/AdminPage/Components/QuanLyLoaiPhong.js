import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill'; 
import axios from "axios";

const QuanLyLoaiPhong = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRoomType, setCurrentRoomType] = useState(null);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await axios.get("${process.env.REACT_APP_API_BASE_URL}/loai-phong");
      setRoomTypes(response.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách loại phòng");
    }
  };

  const handleAdd = () => {
    setIsEditing(false);             // Set editing state to false (for add mode)
    setCurrentRoomType(null);        // Reset the current room type (no editing)
    form.resetFields();              // Reset the form fields for a fresh start
    setIsModalVisible(true);         // Show the modal to add a new room type
  };

  const handleEdit = (roomType) => {
    setIsEditing(true);
    setCurrentRoomType(roomType);
    form.setFieldsValue(roomType);  // Pre-fill the form with room type data
    setIsModalVisible(true);
  };

  const handleDelete = async (roomTypeId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/loai-phong/${roomTypeId}`);
      setRoomTypes(roomTypes.filter((roomType) => roomType.id !== roomTypeId));
      message.success("Xóa loại phòng thành công");
    } catch (error) {
      message.error("Lỗi khi xóa loại phòng");
    }
  };

  const handleOk = async (values) => {
    // Kiểm tra trùng tên phòng
    const isNameExist = roomTypes.some(
      (roomType) => roomType.tenPhong.toLowerCase() === values.tenPhong.toLowerCase() && roomType.id !== currentRoomType?.id
    );
    if (isNameExist) {
      message.error("Tên phòng này đã tồn tại. Vui lòng chọn tên khác.");
      return;
    }
  
    try {
      if (currentRoomType) {
        // Edit mode
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/loai-phong/${currentRoomType.id}`, values);
        setRoomTypes(roomTypes.map((roomType) => (roomType.id === currentRoomType.id ? { ...values, id: currentRoomType.id } : roomType)));
        message.success("Cập nhật loại phòng thành công");
      } else {
        // Add mode
        const response = await axios.post("${process.env.REACT_APP_API_BASE_URL}/loai-phong", values);
        setRoomTypes([...roomTypes, response.data]);
        fetchRoomTypes();  // Lấy lại danh sách phòng sau khi thêm
        message.success("Thêm loại phòng thành công");
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error("Lỗi khi lưu loại phòng");
    }
  };
  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên Phòng", dataIndex: "tenPhong", key: "tenPhong" },
    {
      title: "Mô Tả Phòng",
      dataIndex: "mo_ta_phong",
      key: "mo_ta_phong",
      width: 1100, 
      render: (text) => {
        const limitWords = (text, wordLimit) => {
          const words = text.split(" ");
          if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
          }
          return text;
        };
        return limitWords(text, 50); // Hiển thị 200 từ đầu tiên
      },
    },
    
    {
      title: "Hành Động",
      key: "action",
      align: 'center',
      render: (record) => (
        <div>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 10 }} icon={<EditOutlined />} />
          <Button onClick={() => handleDelete(record.id)} danger icon={<DeleteOutlined />} />
        </div>
      ),
    },
  ];

  return (
    <div>
     <Button type="primary" onClick={handleAdd}  className="btn-Add" icon={<PlusOutlined />}>
        Thêm Loại Phòng
      </Button>
      <Table dataSource={roomTypes} columns={columns} rowKey="id" />

      <Modal
        title={isEditing ? "Chỉnh sửa Loại Phòng" : "Thêm Loại Phòng"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className='adminModal'
      >
        <Form form={form} onFinish={handleOk} layout="vertical">
          <Form.Item
            name="tenPhong"
            label="Tên Phòng"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="mo_ta_phong" label="Mô Tả Phòng" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <ReactQuill style={{ height: '200px' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {isEditing ? "Cập nhật" : "Thêm"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyLoaiPhong;
