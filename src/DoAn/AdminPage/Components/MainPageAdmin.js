import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext.js'; // Import the useUser hook
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  UserOutlined,
  DashboardOutlined,
  ProductOutlined,
  GiftOutlined,
  LogoutOutlined,
  ReadOutlined,
  DollarOutlined, 
  FolderOutlined, 
  LinkOutlined, 
  AppstoreAddOutlined, 
  ContainerOutlined,
  BgColorsOutlined,
  ColumnWidthOutlined,
  GroupOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Row, Col, Avatar } from 'antd';
import QuanLySanPham from '../Components/QuanLySanPham';
import QuanLyDonHang from '../Components/QuanLyDonHang';
import QuanLyTinTuc from '../Components/QuanLyTinTuc';
import QuanLyKhuyenMai from '../Components/QuanLyKhuyenMai.js';
import Dashboard from '../Components/DashBoard';
import "../css/PageAdmin.css";
import QuanLyDoanhThu from './QuanLyDoanhThu.js';
import QuanLyDanhMuc from './QuanLyDanhMuc.js';
import QuanLyTaiKhoan from './QuanLyTaiKhoan.js';
import QuanLyLoaiSP from './QuanLyLoaiSP.js';
import QuanLyLoaiPhong from './QuanLyLoaiPhong.js';
import QuanLyKichThuoc from './QuanLyKichThuoc.js';
import QuanLyMauSac from './QuanLyMauSac.js';
const { Header, Sider, Content } = Layout;

function MainPageAdmin() {
  const [collapsed, setCollapsed] = useState(false);
  const [contentKey, setContentKey] = useState('dashboard');
  const { adminUser, logout} = useUser(); // Access user and actions from UserContext

  
  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined/>,
      label: 'Dashoard'
    },
    {
      key: 'quanlysanpham',
      icon: <ProductOutlined />,
      label: 'Sản phẩm'
    },
    {
      icon: <FolderOutlined />,
      label: 'Danh mục',
      children: [
        {
          key: 'quanlydanhmuc',
          label: 'Liên kết',
          icon: <LinkOutlined />, // Icon cho Liên kết
        },
        {
          key: 'loai_phong',
          label: 'Loại phòng',
          icon: <AppstoreAddOutlined />, // Icon cho Loại phòng
        },
        {
          key: 'loai_sanpham',
          label: 'Loại sản phẩm',
          icon: <ContainerOutlined />, // Icon cho Loại sản phẩm
        },
      ],
    },
    {
      key: 'quanlytaikhoan',
      icon: <GroupOutlined/>,
      label: 'Khách hàng'
    },
    {
      key: 'quanlykichthuoc',
      icon: <ColumnWidthOutlined/>,
      label: 'Kích thước'
    },
    {
      key: 'quanlymausac',
      icon: <BgColorsOutlined/>,  
      label: 'Màu sắc'
    },
    {
      key: 'quanlytintuc',
      icon: <ReadOutlined />,
      label: 'Tin tức'
    },
    {
      key: 'quanlydonhang',
      icon: <ShoppingOutlined />,
      label: 'Đơn hàng'
    },
    {
      key: 'quanlydoanhthu',
      icon: <DollarOutlined/>,
      label: 'Doanh thu'
    },
    {
      key: 'quanlykhuyenmai',
      icon: <GiftOutlined/>,
      label: 'Khuyến mãi'
    },
    {
      key: '/logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất'
    }
  ];

  const renderContent = () => {
    switch (contentKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'quanlysanpham':
        return <QuanLySanPham />;
      case 'quanlytintuc':
        return <QuanLyTinTuc />;
      case 'quanlydonhang':
        return <QuanLyDonHang />;
      case 'quanlydoanhthu':
        return <QuanLyDoanhThu />;
      case 'quanlykhuyenmai':
        return <QuanLyKhuyenMai />;
      case 'quanlydanhmuc':
        return <QuanLyDanhMuc />; 
      case 'quanlytaikhoan':
        return <QuanLyTaiKhoan/>; 
      case 'loai_phong':
        return <QuanLyLoaiPhong/>
      case 'loai_sanpham':
        return <QuanLyLoaiSP/>
      case 'quanlykichthuoc':
        return <QuanLyKichThuoc/>
      case 'quanlymausac':
        return <QuanLyMauSac/>
      default:
        return null;
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
      const storedAdminUser = localStorage.getItem('admin_user');
      
      if (!storedAdminUser) {
          // Nếu không có admin_user trong localStorage, điều hướng về trang đăng nhập
          navigate('/dangnhap');
      }
  }, [navigate]);

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed} className="sider-wrapper">
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[contentKey]}
          onClick={(item) => {
            if (item.key === '/logout') {
              logout('admin')
            } else {
              setContentKey(item.key);
            }
          }}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1,
            width: '100%',
            position: "fixed"
          }}
        >
          <Row>
            <Col md={18}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </Col>
            <Col md={6}>
              <Avatar size="default" icon={<UserOutlined />} /> {adminUser?.ho_ten}
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            margin: '80px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainPageAdmin;
