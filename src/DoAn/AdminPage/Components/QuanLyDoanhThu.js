import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Table, Spin, DatePicker, Button } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;

const QuanLyDoanhThu = () => {
    const [period, setPeriod] = useState('day');  // Mặc định là 'day'
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Hàm gọi API để lấy doanh thu
    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:4000/api/doanh-thu?period=${period}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`;
            }

            const response = await axios.get(url);
            setRevenueData(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API mỗi khi period, startDate hoặc endDate thay đổi
    useEffect(() => {
        fetchRevenueData();
    }, [period, startDate, endDate]);

    // Cột dữ liệu trong bảng
    const columns = period === 'day' 
        ? [
            { title: 'Ngày', dataIndex: 'ngay', key: 'ngay' },
            { title: 'Tổng Doanh Thu', dataIndex: 'tong_doanh_thu', key: 'tong_doanh_thu',render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text) },
            { title: 'Tổng Số Đơn Hàng', dataIndex: 'tong_so_don_hang', key: 'tong_so_don_hang' },
            { title: 'Tổng Số Sản Phẩm', dataIndex: 'tong_so_san_pham', key: 'tong_so_san_pham' },
            { title: 'Tổng Lợi Nhuận', dataIndex: 'tong_loi_nhuan', key: 'tong_loi_nhuan',render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)  },
        ]
        : period === 'month'
        ? [
            { title: 'Tháng', dataIndex: 'month', key: 'month' },
            { title: 'Tổng Doanh Thu', dataIndex: 'tong_doanh_thu', key: 'tong_doanh_thu', render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text) },
            { title: 'Tổng Số Đơn Hàng', dataIndex: 'tong_so_don_hang', key: 'tong_so_don_hang' },
            { title: 'Tổng Số Sản Phẩm', dataIndex: 'tong_so_san_pham', key: 'tong_so_san_pham' },
            { title: 'Tổng Lợi Nhuận', dataIndex: 'tong_loi_nhuan', key: 'tong_loi_nhuan',render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)  },
        ]
        : [
            { title: 'Năm', dataIndex: 'year', key: 'year' },
            { title: 'Tổng Doanh Thu', dataIndex: 'tong_doanh_thu', key: 'tong_doanh_thu', render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)  },
            { title: 'Tổng Số Đơn Hàng', dataIndex: 'tong_so_don_hang', key: 'tong_so_don_hang' },
            { title: 'Tổng Số Sản Phẩm', dataIndex: 'tong_so_san_pham', key: 'tong_so_san_pham' },
            { title: 'Tổng Lợi Nhuận', dataIndex: 'tong_loi_nhuan', key: 'tong_loi_nhuan', render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)  },
        ];

    // Hàm xử lý thay đổi khoảng thời gian
    const handlePeriodChange = value => {
        setPeriod(value);
    };

    // Hàm xử lý thay đổi ngày
    const handleDateChange = (dates) => {
        setStartDate(dates ? dates[0] : null);
        setEndDate(dates ? dates[1] : null);
    };

    return (
        <div>
            <h2>Quản lý Doanh Thu</h2>

            <div style={{ marginBottom: 16 }}>
                <Select defaultValue="day" style={{ width: 120 }} onChange={handlePeriodChange}>
                    <Option value="day">Ngày</Option>
                    <Option value="month">Tháng</Option>
                    <Option value="year">Năm</Option>
                </Select>
                <RangePicker onChange={handleDateChange} />
                <Button onClick={fetchRevenueData} type="primary" style={{ marginLeft: 10 }}>
                    Lọc
                </Button>
            </div>

            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    dataSource={revenueData}
                    columns={columns}
                    rowKey={period === 'day' ? 'ngay' : period === 'month' ? 'month' : 'year'}
                    pagination={false}
                />
            )}
        </div>
    );
};

export default QuanLyDoanhThu;
