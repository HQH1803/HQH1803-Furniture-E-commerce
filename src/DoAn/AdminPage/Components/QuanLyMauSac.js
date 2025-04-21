import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, ColorPicker, message } from "antd";
import axios from "axios";

const QuanLyMauSac = () => {
  const [mauSacData, setMauSacData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  useEffect(() => {
    fetchMauSacData();
  }, []);

  const fetchMauSacData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/mau-sac`);
      setMauSacData(res.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    }
    setLoading(false);
  };

  const openModal = (record) => {
    setIsEditMode(true);
    if (record) {
      form.setFieldsValue({ tenMau: record.ten_mau, maMau: record.ma_mau });
      setSelectedColor(record.ma_mau);  // Set the selected color when editing
      setEditingRecord(record);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.toHexString()); // Cập nhật màu sắc được chọn
  };

  const handleModalOk = async () => {
    try {
      const values = form.getFieldsValue();
      if (isEditMode) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/mau-sac/${editingRecord.id}`, {
          ten_mau: values.tenMau,
          ma_mau: selectedColor,
        });
        message.success("Cập nhật màu sắc thành công");
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/mau-sac`, {
          ten_mau: values.tenMau,
          ma_mau: selectedColor,
        });
        message.success("Thêm màu sắc thành công");
      }
      setIsModalOpen(false);
      fetchMauSacData();
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.error);
      } else {
        message.error("Lỗi khi cập nhật màu sắc");
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/mau-sac/${id}`);
      message.success("Xóa màu sắc thành công");
      fetchMauSacData();
    } catch (error) {
      message.error("Lỗi khi xóa màu sắc");
    }
  };

  const columns = [
    {
      title: "Tên Màu",
      dataIndex: "ten_mau",
      key: "ten_mau",
    },
    {
      title: "Mã Màu",
      dataIndex: "ma_mau",
      key: "maMau",
    },
    {
      title: "Action",
      key: "action",
      align: 'center',
      render: (_, record) => (
        <span>
          <Button onClick={() => openModal(record)} style={{ marginRight: 10 }}>Sửa</Button>
          <Button onClick={() => handleDelete(record.id)} danger>Xóa</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản Lý Màu Sắc</h1>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 20 }}>
        Thêm Màu Sắc
      </Button>
      <Table
        columns={columns}
        dataSource={mauSacData}
        loading={loading}
        rowKey="id"
      />

      {/* Modal for adding/editing color */}
      <Modal
        title={isEditMode ? "Cập Nhật Màu Sắc" : "Thêm Màu Sắc"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          {/* Input cho Tên Màu */}
          <Form.Item
            label="Tên Màu"
            name="tenMau"
            rules={[{ required: true, message: "Vui lòng nhập tên màu" }]}
          >
            <Input placeholder="Nhập tên màu" />
          </Form.Item>

          {/* ColorPicker cho Mã Màu */}
          <Form.Item
            label="Mã Màu"
            name="maMau"
            rules={[{ required: true, message: "Vui lòng chọn mã màu" }]}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ColorPicker
                value={selectedColor} // Giá trị hiện tại
                onChange={handleColorChange} // Hàm xử lý khi chọn màu
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: selectedColor,
                  border: "1px solid #d9d9d9",
                }}
              />
            </div>
            <p style={{ marginTop: "8px" }}>Mã màu hiện tại: {selectedColor}</p>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyMauSac;
