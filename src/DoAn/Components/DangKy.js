import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/dangnhap.css'; // Đảm bảo bạn có file CSS đúng
import { message } from 'antd'; // Sử dụng Ant Design để hiển thị thông báo

const DangKy = () => {
    const [registerEmail, setRegisterEmail] = useState(''); // Email
    const [registerPassword, setRegisterPassword] = useState(''); // Password
    const [confirmPassword, setConfirmPassword] = useState(''); // Confirm password
    const [registerHoTen, setRegisterHoTen] = useState(''); // Họ tên
    const [registerSdt, setRegisterSdt] = useState(''); // Số điện thoại
    const [error, setError] = useState(''); // Thông báo lỗi
    const [success, setSuccess] = useState(''); // Thông báo thành công
    const navigate = useNavigate();

    // Xử lý sự kiện khi form đăng ký được submit
    const handleRegisterSubmit = async (event) => {
        event.preventDefault(); // Ngăn không submit form mặc định
        setError(''); // Xóa lỗi trước đó
        setSuccess(''); // Xóa thông báo thành công trước đó

        // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
        if (registerPassword !== confirmPassword) {
            setError('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: registerEmail.trim(), // Cắt khoảng trắng thừa ở email
                    password: registerPassword,
                    ho_ten: registerHoTen.trim(), // Cắt khoảng trắng thừa ở họ tên
                    sdt: registerSdt.trim(), // Cắt khoảng trắng thừa ở số điện thoại
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                message.success('Đăng ký tài khoản thành công'); // Hiển thị thông báo thành công bằng Ant Design
                navigate('/dangnhap'); // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
            } else {
                setError(data.message); // Hiển thị lỗi nếu đăng ký thất bại
            }
        } catch (error) {
            setError('Có lỗi xảy ra, vui lòng thử lại.'); // Hiển thị lỗi khi có sự cố trong quá trình kết nối
        }
    };

    return (
        <div className="container">
            <div className="register-container">
                <div className="register-form">
                    <h2>Đăng ký</h2>
                    {error && <div className="error-message">{error}</div>} {/* Hiển thị thông báo lỗi */}
                    {success && <div className="success-message">{success}</div>} {/* Hiển thị thông báo thành công */}
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="input-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={registerHoTen}
                                onChange={(e) => setRegisterHoTen(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>E-mail</label>
                            <input
                                type="email"
                                placeholder="username@gmail.com"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                placeholder="0123456789"
                                value={registerSdt}
                                onChange={(e) => setRegisterSdt(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="register-btn">Đăng ký</button>
                    </form>
                    <div className="lk-login">
                        <p>Bạn đã có tài khoản?</p>
                        <Link to="/dangnhap">Đăng nhập</Link> {/* Link đến trang đăng nhập */}
                    </div>
                </div>
                <div className="register-image">
                    <img src={require("../images/Logo/RegisterBanner.webp")} alt="Giày" />
                </div>
            </div>
        </div>
    );
};

export default DangKy;
