import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; // Giả sử bạn có UserContext để quản lý trạng thái người dùng
import '../css/dangnhap.css'; // Đảm bảo rằng file CSS này có các kiểu cần thiết

import { GoogleLogin } from '@react-oauth/google';
import { LoginSocialFacebook } from 'reactjs-social-login';
import { FacebookLoginButton } from 'react-social-login-buttons';

const DangNhap = () => {
    const [loginEmail, setLoginEmail] = useState(''); // State cho email
    const [loginPassword, setLoginPassword] = useState(''); // State cho mật khẩu
    const [error, setError] = useState(''); // State cho thông báo lỗi
    const {adminUser,customerUser, login} = useUser();
    const navigate = useNavigate(); // Hook điều hướng
      // Nếu đã đăng nhập, điều hướng đến trang chủ hoặc trang cá nhân



// Xử lý sự kiện submit form đăng nhập
const handleLoginSubmit = async (event) => {
    event.preventDefault(); // Ngừng reload trang khi submit form

    if (!loginEmail || !loginPassword) {
        setError('Email và mật khẩu không được để trống.');
        return;
    }

    try {
         const message = await login(loginEmail, loginPassword); // Gọi hàm login từ context và truyền vào email, mật khẩu
        console.log(message); // Thông báo đăng nhập thành công (được trả về từ context)



    } catch (error) {
        // Nếu có lỗi, hiển thị thông báo lỗi
        setError(error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    }
};

    const handleGoogleLogin = async (credentialResponse) => {
        const { credential } = credentialResponse;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/google-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken: credential }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập Google không thành công');
            }
            const userData = data.user;
            if (userData) {
                const user = {
                    email: userData.email,
                    ho_ten: userData.ho_ten,
                    role: userData.role,
                    mat_khau: userData.mat_khau,
                    sdt: userData.sdt,
                };
                const message = await  login(user.email,user.mat_khau)
                message.success(message)
            } else {
                throw new Error('Không có thông tin người dùng trong phản hồi');
            }
        } catch (error) {
            console.error("Lỗi trong quá trình đăng nhập:", error);
            setError(error.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
        }
    };
    
    const handleFacebookLogin = async (response) => {
        const { accessToken, userID, email, name } = response.data;
    
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/facebook-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ accessToken, userID, email, name }),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.message || 'Đăng nhập Facebook không thành công');
            }// Lấy thông tin người dùng từ dữ liệu phản hồi
        const userData = data.user;
        if (userData) {
            const user = {
                email: userData.email,
                ho_ten: userData.ho_ten,
                role: userData.role,
                mat_khau: userData.mat_khau,
                sdt: userData.sdt,
            };
            const message = await  login(user.email,user.mat_khau)
            message.success(message)
        } else {
            throw new Error('Không có thông tin người dùng trong phản hồi');
        }
        // Kiểm tra vai trò người dùng và xử lý
        
        } catch (error) {
            console.error("Lỗi trong quá trình đăng nhập Facebook:", error);
            setError(error.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
        }
    };
    
    
    return (
        <div className='container'>
            <div className="login-container">
                <div className="login-form">
                    <h2>Đăng nhập</h2>
                    <p>Đăng nhập bằng mạng xã hội</p>
                    <div className="social-login">
                        <GoogleLogin className='btn-google'
                            onSuccess={handleGoogleLogin} // Xử lý đăng nhập thành công
                            onError={() => {
                                console.log('Đăng nhập không thành công');
                                setError('Đăng nhập Google không thành công. Vui lòng thử lại.'); // Thiết lập thông báo lỗi
                            }}
                        />
                        <div>
                            <LoginSocialFacebook
                                className="btn-fb"
                                appId={process.env.REACT_APP_API_APPID_FACEBOOK}
                                onResolve={handleFacebookLogin}  // Sử dụng hàm đã định nghĩa
                                onReject={(error) => {
                                    console.error("Lỗi trong quá trình đăng nhập Facebook:", error);
                                }}
                            >
                                <FacebookLoginButton
                                 style={{
                                    display: 'block',
                                    border: '0px',
                                    borderRadius: '3px',
                                    boxShadow: 'rgba(0, 0, 0, 0.5) 0px 1px 2px',
                                    color: 'rgb(255, 255, 255)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    margin:'none',
                                    width: '100%',
                                    overflow: 'hidden',
                                    padding: '0px 18px',
                                    userSelect: 'none',
                                    height: '39px',
                                    background: 'rgb(59, 89, 152)',
                                  }}/>
                            </LoginSocialFacebook>

                        </div>                        
                    </div>
                    <p>hoặc</p>
                    {error && <div className="error-message">{error}</div>} {/* Hiển thị thông báo lỗi */}
                    <form onSubmit={handleLoginSubmit}>
                        <div className="input-group">
                            <label>E-mail</label>
                            <input
                                type="email"
                                placeholder="username@gmail.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">Đăng nhập</button>
                    </form>
                    <div className="lk-register">
                        <p>Bạn chưa có tài khoản?</p>
                        <Link to="/dangky">Đăng ký</Link>
                    </div>
                </div>
                <div className="login-image">
                    <img src={require("../images/Logo/LoginBanner.webp")} alt="Giày" />
                </div>
            </div>
        </div>
    );
};

export default DangNhap;
