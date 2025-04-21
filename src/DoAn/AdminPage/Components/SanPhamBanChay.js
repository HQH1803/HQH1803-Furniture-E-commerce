import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const SanPhamBanChay = ({ limit }) => {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    // Gửi yêu cầu API để lấy sản phẩm bán chạy nhất
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/san-pham-ban-chay?limit=${limit}`)
      .then(res => {
        setTopProducts(res.data);
      })
      .catch(err => {
        console.error('Lỗi khi lấy sản phẩm bán chạy:', err);
      });
  }, [limit]);

  // Lấy tên sản phẩm và số lượng đã bán
  const labels = topProducts.map(product => product.tenSP);
  const data = topProducts.map(product => product.total_sold);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Sản Phẩm Bán Chạy',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="top-products">
      <h3>Sản Phẩm Bán Chạy Nhất</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default SanPhamBanChay;
