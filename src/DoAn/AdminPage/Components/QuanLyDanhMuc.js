import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Select, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from "axios";

const { Option } = Select;

const QuanLyDanhMuc = () => {
  const [loading, setLoading] = useState(false);
  const [loaiPhong, setLoaiPhong] = useState([]);
  const [loaiSanPham, setLoaiSanPham] = useState([]);
  const [danhSachLienKet, setDanhSachLienKet] = useState([]);
  const [danhSachPhong, setDanhSachPhong] = useState([]); // To store the room types and product details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [isAllDetailModalOpen, setIsAllDetailModalOpen] = useState(false); // For the "Xem Chi Tiết Tất Cả" modal
  const [allDetailsData, setAllDetailsData] = useState([]); // To store all details data

  // Fetch data for loaiPhong, loaiSanPham, and existing links
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loaiPhongRes, loaiSanPhamRes, lienKetRes, phongRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loai-phong`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loai-san-pham`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loai-phong-san-pham`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/danh-sach-phong`), // Fetch room types and products
      ]);
      setLoaiPhong(loaiPhongRes.data);
      setLoaiSanPham(loaiSanPhamRes.data);
      setDanhSachLienKet(lienKetRes.data);
      setDanhSachPhong(phongRes.data); // Store room and product details
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    }
    setLoading(false);
  };

  const openModal = (record = null) => {
    setIsEditMode(!!record);
    if (record) {
      form.setFieldsValue({
        loaiPhong: record.loai_phong_id,
        loaiSanPham: record.loai_san_pham_id,
      });
      setEditingRecord(record);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = form.getFieldsValue();
  
      // Check if the combination of Loại Phòng and Loại Sản Phẩm already exists
      const existingLink = danhSachLienKet.find(
        (item) =>
          item.loai_phong_id === values.loaiPhong && item.loai_san_pham_id === values.loaiSanPham
      );
  
      if (existingLink) {
        message.warning("Liên kết Loại Phòng và Loại Sản Phẩm đã tồn tại.");
        return;
      }
  
      if (isEditMode) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/loai-phong-san-pham/${editingRecord.id}`, {
          loai_phong_id: values.loaiPhong,
          loai_san_pham_id: values.loaiSanPham,
        });
        message.success("Cập nhật thành công");
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/loai-phong-san-pham`, {
          loai_phong_id: values.loaiPhong,
          loai_san_pham_id: values.loaiSanPham,
        });
        message.success("Liên kết thành công");
      }
  
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error("Lỗi khi cập nhật liên kết");
    }
  };
  

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (record) => {
    openModal(record);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/loai-phong-san-pham/${id}`);
      message.success("Xóa liên kết thành công");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi xóa liên kết");
    }
  };


  const handleViewAllDetails = () => {
    setAllDetailsData(danhSachPhong); // Show all room details
    setIsAllDetailModalOpen(true);
  };

  const handleAllDetailModalCancel = () => {
    setIsAllDetailModalOpen(false);
  };

  const columns = [
    {
      title: "Loại Phòng",
      dataIndex: "loai_phong_id",
      key: "loai_phong_id",
      render: (text) => loaiPhong.find((item) => item.id === text)?.tenPhong,
    },
    {
      title: "Loại Sản Phẩm",
      dataIndex: "loai_san_pham_id",
      key: "loai_san_pham_id",
      render: (text) => loaiSanPham.find((item) => item.id === text)?.tenLoaiSP,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span>
            <Button onClick={() => handleEdit(record)} style={{ marginRight: 10 }} icon={<EditOutlined />} />
            <Button onClick={() => handleDelete(record.id)} danger icon={<DeleteOutlined />} />   
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản Lý Danh Mục</h1>
        <div className="button-container">
        <Button type="primary" onClick={() => openModal()} icon={<PlusOutlined />}>Thêm Liên Kết</Button>
        <Button type="default" onClick={handleViewAllDetails}>Xem Chi Tiết Tất Cả</Button>
        </div>
        <Table
        columns={columns}
        dataSource={danhSachLienKet}
        loading={loading}
        rowKey="id"
        style={{ marginTop: 20 }}
        />

      
      {/* Modal for editing/creating links */}
      <Modal
        title={isEditMode ? "Cập Nhật Liên Kết" : "Thêm Liên Kết"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Loại Phòng" name="loaiPhong" rules={[{ required: true, message: "Vui lòng chọn loại phòng" }]}>
            <Select placeholder="Chọn loại phòng">
              {loaiPhong.map((phong) => (
                <Option key={phong.id} value={phong.id}>{phong.tenPhong}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Loại Sản Phẩm" name="loaiSanPham" rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm" }]}>
            <Select placeholder="Chọn loại sản phẩm">
              {loaiSanPham.map((sanPham) => (
                <Option key={sanPham.id} value={sanPham.id}>{sanPham.tenLoaiSP}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

        {/* Modal for viewing all product details */}
        <Modal
        title="Chi Tiết Danh Mục"
        open={isAllDetailModalOpen}
        onCancel={handleAllDetailModalCancel}
        footer={[<Button key="close" onClick={handleAllDetailModalCancel}>Đóng</Button>]}
        width={800}
        className="product-details-modal"  // Apply the custom class here
        >
        {allDetailsData.length > 0 ? (
            <div>
            <ul>
                {allDetailsData.map((item, index) => (
                <li key={index}>
                    <h4>{item.LoaiPhong}</h4>
                    <p>
                    Sản phẩm liên quan:{" "}
                    {item.SanPham
                        .split(", ")
                        .map((product) => product.split(":")[1]) // Split by ':' and display only product names
                        .join(", ")}
                    </p>
                </li>
                ))}
            </ul>
            </div>
        ) : (
            <p>Đang tải dữ liệu...</p>
        )}
        </Modal>

    </div>
  );
};

export default QuanLyDanhMuc;
