import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/dashboard.css'; // Import CSS module

const QuanLyTonKho = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedRange, setSelectedRange] = useState(() => {
    // Lấy giá trị từ Local Storage hoặc dùng mặc định là 10
    return localStorage.getItem('selectedRange') 
      ? Number(localStorage.getItem('selectedRange')) 
      : 4;
  });

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await axios.get('http://furniture-e-commerce-wt2i.onrender.com/api/canh-bao-ton-kho', {
          params: { range: selectedRange }, // Gửi range qua API
        });
        setLowStockProducts(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tồn kho", error);
      }
    };
    fetchLowStockProducts();
  }, [selectedRange]); // Gọi lại khi selectedRange thay đổi

  const handleRangeChange = (e) => {
    const newRange = Number(e.target.value);
    setSelectedRange(newRange);
    localStorage.setItem('selectedRange', newRange); // Lưu giá trị vào Local Storage
  };

  return (
    <div>
      <h2 className="qltk-title">Cảnh Báo Tồn Kho</h2>
      
      {/* Bộ lọc chọn range */}
      <div className="qltk-filter">
        <label htmlFor="range">Chọn số lượng tối đa:</label>
        <input
          type="number"
          id="range"
          min="1"
          value={selectedRange}
          onChange={handleRangeChange}
          className="qltk-range-input"
        />
      </div>

      {/* Hiển thị danh sách sản phẩm */}
      {lowStockProducts.length > 0 ? (
        <ul className="qltk-list">
          {lowStockProducts.map((product) => (
            <li key={product.id} className="qltk-item">
              <span>{product.tenSP}</span>
              <span className="qltk-low-stock">Chỉ còn: {product.soluong}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="qltk-no-products">Không có sản phẩm nào sắp hết hàng trong khoảng đã chọn.</p>
      )}
    </div>
  );
};

export default QuanLyTonKho;
