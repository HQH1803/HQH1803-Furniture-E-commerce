import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from "axios";

const QuanLyLoaiSP = () => {
  const [productTypes, setProductTypes] = useState([]);  // State to store the list of product categories
  const [isModalVisible, setIsModalVisible] = useState(false);  // Modal visibility
  const [currentProductType, setCurrentProductType] = useState(null);  // Current product type being edited
  const [form] = Form.useForm();  // Ant Design form
  const [isEditing, setIsEditing] = useState(false);  // To distinguish between adding and editing

  // Fetch product categories from the server
  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get("http://furniture-e-commerce-wt2i.onrender.com/api/loai-san-pham");
      setProductTypes(response.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách loại sản phẩm");
    }
  };

  // Function to handle adding a new product category
  const handleAdd = () => {
    setIsEditing(false);             // Set editing state to false (for add mode)
    setCurrentProductType(null);     // Clear any existing product type data
    form.resetFields();              // Reset the form fields for a fresh start
    setIsModalVisible(true);         // Show the modal to add a new product category
  };

  // Function to handle editing a product category
  const handleEdit = (record) => {
    setIsEditing(true); 
    setCurrentProductType(record);   // Set the current product type to edit
    form.setFieldsValue(record);     // Fill the form with the data of the product type to edit
    setIsModalVisible(true);         // Show the modal
  };

  // Function to handle the form submission for both add and edit
  const handleOk = async (values) => {
    try {
      if (isEditing) {
        // Edit mode
        await axios.put(`http://furniture-e-commerce-wt2i.onrender.com/api/loai-san-pham/${currentProductType.id}`, values);
        setProductTypes(productTypes.map((productType) => 
          productType.id === currentProductType.id ? { ...values, id: currentProductType.id } : productType
        ));
        message.success("Cập nhật loại sản phẩm thành công");
      } else {
        // Add mode
        const response = await axios.post("http://furniture-e-commerce-wt2i.onrender.com/api/loai-san-pham", values);
        setProductTypes([...productTypes, response.data]);
        fetchProductTypes();
        message.success("Thêm loại sản phẩm thành công");
      }
      setIsModalVisible(false);  // Close the modal after submission
    } catch (error) {
      if (error.response && error.response.status === 409) {
        message.error("Tên loại sản phẩm đã tồn tại. Vui lòng nhập tên khác!");
      } else {
        message.error("Lỗi khi lưu loại sản phẩm");
      }
    }
  };
  

  // Function to handle deleting a product category
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://furniture-e-commerce-wt2i.onrender.com/api/loai-san-pham/${id}`);
      setProductTypes(productTypes.filter(productType => productType.id !== id));
      message.success("Xóa loại sản phẩm thành công");
    } catch (error) {
      message.error("Lỗi khi xóa loại sản phẩm");
    }
  };

  // Function to close the modal without saving
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Table columns definition
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { 
      title: "Tên Loại Sản Phẩm", 
      dataIndex: "tenLoaiSP", 
      key: "tenLoaiSP", 
    },
    {
      title: 'Hành Động',
      key: 'action',
      align: 'center',  // Center the action buttons in this column
      render: (record) => (
        <div>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }} icon={<EditOutlined />} />
          <Button onClick={() => handleDelete(record.id)} danger icon={<DeleteOutlined />} />
        </div>
      ),
    }
  ];


  return (
    <div>
      <Button type="primary" onClick={handleAdd}  className="btn-Add" icon={<PlusOutlined />}>
        Thêm Loại Sản Phẩm
      </Button>
      <Table dataSource={productTypes} columns={columns} rowKey="id" />

      {/* Modal for adding/editing product categories */}
      <Modal
        title={isEditing ? "Chỉnh sửa Loại Sản Phẩm" : "Thêm Loại Sản Phẩm"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleOk} layout="vertical">
          <Form.Item
            name="tenLoaiSP"
            label="Tên Loại Sản Phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên loại sản phẩm!" }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {isEditing ? "Cập nhật" : "Thêm"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyLoaiSP;
