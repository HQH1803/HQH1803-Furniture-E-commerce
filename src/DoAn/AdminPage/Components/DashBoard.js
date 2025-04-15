import React, { useState } from 'react';
import ChartDoanhThu from './ChartDoanhThu';
import SanPhamBanChay from '../Components/SanPhamBanChay';
import QuanLyTonKho from '../Components/QuanLyTonKho';
import '../css/dashboard.css';

const Dashboard = () => {
  const [period, setPeriod] = useState('month'); // Mặc định là tháng

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Chọn khoảng thời gian */}
      <div className="period-selector">
        <label htmlFor="period">Chọn khoảng thời gian: </label>
        <select id="period" value={period} onChange={handlePeriodChange}>
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
      </div>

      <div className="metrics">
        {/* Hiển thị tổng doanh thu dưới dạng biểu đồ */}
        <ChartDoanhThu period={period} />

        {/* Hiển thị sản phẩm bán chạy dưới dạng biểu đồ */}
        <SanPhamBanChay limit={5} />
      </div>

      {/* Hiển thị quản lý tồn kho riêng biệt */}
      <div className="inventory-management">
        <QuanLyTonKho />
      </div>
    </div>
  );
};

export default Dashboard;
