import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Select, Pagination } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const { confirm } = Modal;
const { Option } = Select;

function Products() {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [kichThuocList, setKichThuocList] = useState([]); 
  const [mauSacList, setMauSacList] = useState([]);

  const [loaiPhong, setLoaiPhong] = useState([]);
  const [loaiSanPham, setLoaiSanPham] = useState([]);
  const [selectedLoaiPhong, setSelectedLoaiPhong] = useState(null);
  const [selectedLoaiSanPham, setSelectedLoaiSanPham] = useState(null);
  useEffect(() => {
      fetchProducts();
      fetchKichThuoc(); 
      fetchMauSac();
  }, []);
  // Lấy danh sách loại phòng từ API
  useEffect(() => {
    axios.get('http://localhost:4000/api/loai-phong').then(response => {      
      setLoaiPhong(response.data);
    });
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setVisibleProducts(products.slice(startIndex, endIndex));
  }, [currentPage, products, pageSize]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/admin/san-pham');
      setProducts(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách sản phẩm');
    }
  };

  const fetchKichThuoc = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/kich-thuoc');
      setKichThuocList(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách kích thước');
    }
  };

  const fetchMauSac = async () => { 
    try {
      const response = await axios.get('http://localhost:4000/api/mau-sac');
      setMauSacList(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách màu sắc');
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentProduct(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };


const [loading, setLoading] = useState(false);

const handleEdit = async (product) => {
    setLoading(true); // Hiển thị loader
    setIsEdit(true);
    setCurrentProduct(product);
    setIsModalVisible(true);
    axios.get(`http://localhost:4000/api/getKichThuocMauSac/${product.id}`)
        .then(response => {
            const { kichThuoc, mauSac } = response.data;
          console.log("abc",response.data)
            setSelectedLoaiPhong(product.loai_phong_id || [])
            axios.get(`http://localhost:4000/api/getLoaiSanPham/${product.id_loaiSP}`)
                .then(loaiSanPhamResponse => {
                  const uniqueKichThuoc = Array.from(new Set(kichThuoc.map(item => item.id)));
                  const uniqueMauSac = Array.from(new Set(mauSac.map(item => item.id)));               
                  
                    form.setFieldsValue({
                        ...product,
                        gia: product.gia,
                        mo_ta: product.mo_ta,
                        soluong: product.soluong,
                        mo_ta_nho: product.mo_ta_nho,
                        loai_san_pham_ids:  [loaiSanPhamResponse.data.tenLoaiSP],
                        loai_phong_ids: product.loai_phong_id || [],
                        kt_id: uniqueKichThuoc, // Set các id không trùng lặp
                        ms_id: uniqueMauSac,     // Set các id không trùng lặp
                    });

                    setFileList(product.hinh_anh ? [{ url: product.hinh_anh }] : []);
                    setIsModalVisible(true);
                    setLoading(false); // Ẩn loader
                })
                .catch(error => {
                    setLoading(false); // Ẩn loader
                    console.error('Error fetching loai_san_pham:', error);
                });
        })
        .catch(error => {
            setLoading(false); // Ẩn loader
            console.error('Error fetching kich_thuoc_ids and mau_sac_ids:', error);
        });
};


  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:4000/api/admin/san-pham/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
      message.success('Xóa sản phẩm thành công');
    } catch (error) {
      message.error('Không thể xoá! Sản phẩm còn tồn tại ở đơn hàng');
    }
  };

  const showDeleteConfirm = (product) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      icon: <DeleteOutlined />,
      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk: () => handleDelete(product.id),
    });
  };

  const handleFileChange = ({ file, fileList }) => {
    console.log('File Change:', file, fileList);
    if (file.status === 'done') {
      message.success(`${file.name} tải lên thành công.`);
    } else if (file.status === 'error') { 
      message.error(`${file.name} tải lên thất bại.`);
    }
    setFileList(fileList);
  };

  const handleOk = async () => {
    try {
      // Step 1: Validate form values
      const values = await form.validateFields();
      
      // Step 2: Handle image URL from file list
      values.hinh_anh = fileList[0]?.url || '';  // Ensure the file URL is assigned correctly.
      values.kich_thuoc_ids = values.kt_id;
      values.mau_sac_ids = values.ms_id;
      // Kiểm tra và chuẩn hóa `loai_san_pham_ids`
      if (isNaN(values.loai_san_pham_ids[0])) { 
        // Nếu là tên, tìm ID tương ứng
        const matchingItem = loaiSanPham.find(item => item.name === values.loai_san_pham_ids[0]);
        if (matchingItem) {
            values.loai_san_pham_ids = [matchingItem.id];
        } else {
            throw new Error('Không tìm thấy ID cho loại sản phẩm');
        }      
      }
      values.id_loaiSP = parseInt(values.loai_san_pham_ids[0]);
      values.loai_phong_id = values.loai_phong_ids;
      // Step 3: Check if we are editing an existing product or adding a new one
      if (isEdit) {
        // Update existing product
        await axios.put(`http://localhost:4000/api/admin/san-pham/${currentProduct.id}`, values);
        
        // Update product list locally after successful update
        setProducts(products.map(product =>
          product.id === currentProduct.id ? { ...product, ...values } : product
        ));
  
        message.success('Cập nhật sản phẩm thành công');
      } else {
        // Add new product
        const response = await axios.post('http://localhost:4000/api/admin/san-pham', values);
        
        // Update product list locally with the new product
        setProducts(prevProducts => [...prevProducts, response.data]);
  
        message.success('Thêm sản phẩm thành công');
      }
  
      // Step 4: Refresh product list (in case data was changed on the backend)
      fetchProducts();
  
      // Step 5: Close the modal
      setIsModalVisible(false);
  
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };
  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lấy danh sách các loại sản phẩm liên quan đến loại phòng đã chọn
  useEffect(() => {
    if (selectedLoaiPhong) {
      axios.get('http://localhost:4000/api/danh-sach-phong').then(response => {
        // Lọc loại sản phẩm phù hợp với loại phòng đã chọn
        console.log(selectedLoaiPhong)
        const filteredData = response.data.find(
          item => item.LoaiPhongID === selectedLoaiPhong
        );
        if (filteredData) {
          const products = filteredData.SanPham.split(', ');
          const formattedProducts = products.map(product => {
            const [id, name] = product.split(':'); // Tách id và name từ chuỗi 'id:name'
            return { id: id.trim(), name: name.trim() };
          });
  
          setLoaiSanPham(formattedProducts); // Cập nhật state với mảng đối tượng
          console.log(formattedProducts)
        } else {
          setLoaiSanPham([]); // Nếu không có loại sản phẩm cho phòng này, reset lại
        }
      });
    }
  }, [selectedLoaiPhong]);

  const handleLoaiPhongChange = value => {
    setSelectedLoaiPhong(value);
    setSelectedLoaiSanPham(null); // Reset loại sản phẩm khi thay đổi loại phòng
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên Sản Phẩm', dataIndex: 'tenSP', key: 'tenSP' },
    {
      title: 'Hình Ảnh',
      dataIndex: 'hinh_anh',
      key: 'hinh_anh',
      className:"ant-table-cell-img",
      render: (text) => <img src={`${text}`} alt="Sản phẩm"/>,
    },    
    { title: 'Giá', dataIndex: 'gia', key: 'gia', render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text) },
    { title: 'Số Lượng', dataIndex: 'soluong', key: 'soluong' },
    { title: 'Loại Sản Phẩm', dataIndex: 'tenLoaiSP', key: 'loai_san_pham_ids' },
    { title: 'Loại Phòng', dataIndex: 'tenPhong', key: 'loai_phong_ids' },    
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
    <div >
      <Button type="primary" onClick={handleAdd} className='btn-Add' icon={<PlusOutlined />}>
        Thêm Sản Phẩm
      </Button>
      <Table dataSource={visibleProducts} columns={columns} rowKey="id" pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={products.length}
        onChange={handlePageChange}
      />

      <Modal
        title={isEdit ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        className='adminModal'
      >
        <Form form={form} layout="vertical">
          <Form.Item name="tenSP" label="Tên Sản Phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="hinh_anh" label="Hình Ảnh">
            <Upload
              action="http://localhost:4000/api/admin/upload"
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
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
                  file.url = `http://localhost:4000${result.url}`;
                  onSuccess(result, file);
                  setFileList([file]);
                } catch (error) {
                  onError(error);
                }
              }}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item name="mo_ta" label="Mô Tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <ReactQuill style={{ height: '200px' }} />
          </Form.Item>
          <Form.Item name="mo_ta_nho" label="Mô tả nhỏ" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
            <ReactQuill style={{ height: '100px' }} />
          </Form.Item>
          <Form.Item
            name="gia"
            label="Giá"
            rules={[
              { 
                required: true, 
                message: 'Vui lòng nhập giá!' 
              },
              { 
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject('Giá không được âm!');
                  }
                  return Promise.resolve();
                } 
              }
            ]}
          >
            <InputNumber              
              style={{ width: '100%' }}
              placeholder="Nhập giá"
            />
          </Form.Item>

          <Form.Item
            name="soluong"
            label="Số Lượng"
            rules={[
              { 
                required: true, 
                message: 'Vui lòng nhập số lượng!' 
              },
              { 
                validator: (_, value) => {
                  if (!/^\d+$/.test(value)) {
                    return Promise.reject('Số lượng không được âm!');
                  }
                  return Promise.resolve();
                } 
              }
            ]}
          >
            
            <InputNumber
              style={{ width: '30%' }}
              placeholder="Nhập số lượng"
            />
          </Form.Item>    
         
          <Form.Item name="loai_phong_ids" label="Loại phòng" rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]} > 
            <Select
              value={selectedLoaiPhong}
              onChange={handleLoaiPhongChange}
              placeholder="Chọn loại phòng"
            >
              {loaiPhong.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.tenPhong}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="loai_san_pham_ids"
            label="Loại sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' },]} // Validation
          >
            <Select
              value={selectedLoaiSanPham}
              onChange={value => setSelectedLoaiSanPham(value)}
              placeholder="Vui lòng chọn loại phòng trước"
            >
              {loaiSanPham.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item name="kt_id" label="Kích Thước" rules={[{ required: true, message: 'Vui lòng chọn kích thước!' }]}>
            <Select mode="multiple" placeholder="Chọn kích thước">
              {kichThuocList.map((kichThuoc) => (
                <Option key={kichThuoc.id} value={kichThuoc.id}>
                  {kichThuoc.kich_thuoc}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="ms_id" label="Màu Sắc" rules={[{ required: true, message: 'Vui lòng chọn màu sắc!' }]}>
            <Select mode="multiple" placeholder="Chọn màu sắc">
              {mauSacList.map((mauSac) => (
                <Option key={mauSac.id} value={mauSac.id}>
                  {mauSac.ten_mau}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Products;
