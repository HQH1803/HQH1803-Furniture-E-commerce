import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Dùng useNavigate để điều hướng
import { Modal } from 'antd';
// Tạo UserContext
const UserContext = createContext();

// Tạo hook tùy chỉnh để sử dụng UserContext
export const useUser = () => useContext(UserContext);

// Tạo UserProvider component
export const UserProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [customerUser, setCustomerUser] = useState(null);
    const [error, setError] = useState(""); // Lưu thông báo lỗi
    const navigate = useNavigate(); // Dùng useNavigate để điều hướng

    // Kiểm tra localStorage để lấy thông tin người dùng khi khởi động ứng dụng
    useEffect(() => {
        const storedAdminUser = localStorage.getItem('admin_user');
        const storedCustomerUser = localStorage.getItem('customer_user');
    
        if (storedAdminUser) {
            setAdminUser(JSON.parse(storedAdminUser)); // Đặt người dùng admin nếu tìm thấy trong localStorage
        }
    
        if (storedCustomerUser) {
            setCustomerUser(JSON.parse(storedCustomerUser)); // Đặt người dùng customer nếu tìm thấy trong localStorage
            console.log(localStorage.getItem('customer_user'))
        }
    
    
    }, [navigate]);
    
    // Hàm đăng nhập người dùng
    const login = async (email, password) => {
        setError(''); // Xóa thông báo lỗi cũ
        try {
            console.log('Gửi yêu cầu đăng nhập với email: ', email, ' và password: ', password); // Log dữ liệu
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();
            console.log('Dữ liệu phản hồi từ server: ', data); // Log dữ liệu phản hồi từ server

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập không thành công');
            }

            const userData = {
                email: data.user.email,
                ho_ten: data.user.ho_ten,
                sdt: data.user.sdt,
                role: data.user.role,
            };

            if (userData.role === 'admin') {
                setAdminUser(userData);
                localStorage.setItem('admin_user', JSON.stringify(userData)); // Lưu thông tin admin vào localStorage
                navigate('/adminpage');
            } else if (userData.role === 'customer') {
                setCustomerUser(userData);
                localStorage.setItem('customer_user', JSON.stringify(userData)); // Lưu thông tin customer vào localStorage
                navigate('/');
            }

            return data.message;
        } catch (error) {
            setError(error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.');
            throw error;
        }
    };

    const logout = (role) => {
        Modal.confirm({
            title: 'Đăng xuất',
            content: 'Bạn có chắc chắn muốn đăng xuất không?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: () => {
                if (role === 'admin') {
                    setAdminUser(null);
                    localStorage.removeItem('admin_user'); // Xóa thông tin người dùng admin
                } else if (role === 'customer') {
                    setCustomerUser(null);
                    localStorage.removeItem('customer_user'); // Xóa thông tin người dùng customer
                }
                navigate('/'); // Quay lại trang chính khi đăng xuất
            },
        });
    };
    

    // Hàm cập nhật thông tin người dùng
    const updateUser = async ({ email, ho_ten, sdt }, role) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, ho_ten, sdt }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Đã xảy ra lỗi trong quá trình cập nhật thông tin người dùng');
            }
    
            const data = await response.json();
            
            if (role === 'admin') {
                setAdminUser(prevUser => {
                    const updatedUser = { ...prevUser, ho_ten, sdt };
                    localStorage.setItem('admin_user', JSON.stringify(updatedUser)); // Lưu lại thông tin admin vào localStorage
                    return updatedUser;
                });
            } else if (role === 'customer') {
                setCustomerUser(prevUser => {
                    const updatedUser = { ...prevUser, ho_ten, sdt };
                    localStorage.setItem('customer_user', JSON.stringify(updatedUser)); // Lưu lại thông tin customer vào localStorage
                    return updatedUser;
                });
            }
    
            return data.message;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };
    
    

    // Hàm cập nhật mật khẩu người dùng
    const updatePassword = async ({ email, currentPassword, newPassword }, role) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, currentPassword, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Đã xảy ra lỗi trong quá trình cập nhật mật khẩu');
            }

            const data = await response.json();
            return data.message;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    };

    return (
        <UserContext.Provider value={{
            adminUser,
            customerUser,
            login,
            logout,
            updateUser,
            updatePassword,
            error
        }}>
            {children}
        </UserContext.Provider>
    );
};
