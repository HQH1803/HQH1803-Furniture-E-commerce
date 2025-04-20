import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import axios from "axios";

const QuanLyKichThuoc = () => {
  const [kichThuocData, setKichThuocData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchKichThuocData();
  }, []);

  const fetchKichThuocData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://furniture-e-commerce-wt2i.onrender.com/api/kich-thuoc");
      setKichThuocData(res.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    }
    setLoading(false);
  };

  const openModal = (record = null) => {
    setIsEditMode(!!record);
    if (record) {
      form.setFieldsValue({ kichThuoc: record.kich_thuoc });
      setEditingRecord(record);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
        const values = form.getFieldsValue();
        if (isEditMode) {
            await axios.put(`http://furniture-e-commerce-wt2i.onrender.com/api/kich-thuoc/${editingRecord.id}`, {
                kich_thuoc: values.kichThuoc,
            });
            message.success("Cập nhật kích thước thành công");
        } else {
            await axios.post("http://furniture-e-commerce-wt2i.onrender.com/api/kich-thuoc", {
                kich_thuoc: values.kichThuoc,
            });
            message.success("Thêm kích thước thành công");
        }
        setIsModalOpen(false);
        fetchKichThuocData();
    } catch (error) {
        if (error.response?.status === 409) {
            message.error("Kích thước này đã tồn tại");
        } else {
            message.error("Lỗi khi cập nhật kích thước");
        }
    }
};


  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://furniture-e-commerce-wt2i.onrender.com/api/kich-thuoc/${id}`);
      message.success("Xóa kích thước thành công");
      fetchKichThuocData();
    } catch (error) {
      message.error("Lỗi khi xóa kích thước");
    }
  };

  const columns = [
    {
      title: "Kích Thước",
      dataIndex: "kich_thuoc",
      key: "kich_thuoc",
    },
    {
      title: "Action",
      key: "action",
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
      <h1>Quản Lý Kích Thước</h1>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 20 }}>Thêm Kích Thước</Button>
      <Table
        columns={columns}
        dataSource={kichThuocData}
        loading={loading}
        rowKey="id"
      />

      {/* Modal for adding/editing size */}
      <Modal
        title={isEditMode ? "Cập Nhật Kích Thước" : "Thêm Kích Thước"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Kích Thước" name="kichThuoc" rules={[{ required: true, message: "Vui lòng nhập kích thước" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyKichThuoc;
