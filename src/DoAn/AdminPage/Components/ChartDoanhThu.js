import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS } from 'chart.js/auto';

const TongDoanhThu = ({ period }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Tổng Doanh Thu',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)', // Đổi màu nền cột
      borderColor: 'rgba(75, 192, 192, 1)', // Màu viền cột
      borderWidth: 1, // Độ dày viền cột
    }],
  });

  useEffect(() => {
    // Gửi yêu cầu API để lấy dữ liệu doanh thu theo khoảng thời gian
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/doanh-thu?period=${period}`)
      .then((res) => {
        const doanhThuData = res.data;

        if (doanhThuData.length > 0) {
          // Lấy dữ liệu từ API để gán cho labels và dataset
          const labels = doanhThuData.map(entry => 
            period === 'month' ? entry.month :
            period === 'year' ? entry.year : 
            entry.ngay
          );
          const revenueData = doanhThuData.map(entry => entry.tong_doanh_thu);

          setChartData({
            labels: labels,
            datasets: [{
              label: 'Tổng Doanh Thu',
              data: revenueData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)', // Đổi màu nền cột
              borderColor: 'rgba(75, 192, 192, 1)', // Màu viền cột
              borderWidth: 1, // Độ dày viền cột
            }],
          });
        } else {
          console.log('Không có dữ liệu doanh thu');
        }
      })
      .catch((err) => {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', err);
      });
  }, [period]);

  return (
    <div className="metric">
      <h3>Biểu Đồ Doanh Thu ({period})</h3>
      {chartData.labels.length > 0 ? (
        <Bar data={chartData} /> // Sử dụng Bar component
      ) : (
        <p>Không có dữ liệu để hiển thị.</p>
      )}
    </div>
  );
};

export default TongDoanhThu;
