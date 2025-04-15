import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { message } from 'antd';
import '../css/userprofile.css';

const UserProfile = () => {
    const { customerUser, updateUser, updatePassword } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [view, setView] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (customerUser) {
            setFormData({
                name: customerUser.ho_ten,
                email: customerUser.email,
                phone: customerUser.sdt,
            });
        }
    }, [customerUser]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({ ...prevData, [name]: value }));
    };

    const resetMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        try {
            const successMessage = await updateUser({ 
                email: formData.email,
                ho_ten: formData.name, 
                sdt: formData.phone 
            }, 'customer');
            message.success(successMessage);
            setFormData({name: '', email: '', phone: '',})
            setView("profile");  // Quay lại tab thông tin sau khi cập nhật thành công
        } catch (error) {
            setErrorMessage('Đã xảy ra lỗi trong quá trình cập nhật thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        resetMessages();

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setErrorMessage("Mật khẩu mới và mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);
        try {
            const successMessage = await updatePassword({
                email: customerUser.email,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            }, 'customer');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            message.success('Cập nhật mật khẩu thành công');
            setView("profile"); // Quay lại tab thông tin sau khi thay đổi mật khẩu
        } catch (error) {
            setErrorMessage('Đã xảy ra lỗi trong quá trình cập nhật mật khẩu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!customerUser) {
        return <p>Loading...</p>;
    }

    return (
        <div className="user-profile">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {view === "profile" ? (
                <>
                    <h2>Thông Tin Cá Nhân</h2>
                    <div className="profile-info">
                        <p><strong>Họ và Tên:</strong> {customerUser.ho_ten}</p>
                        <p><strong>Email:</strong> {customerUser.email}</p>
                        <p><strong>Số Điện Thoại:</strong> {customerUser.sdt}</p>
                        <button onClick={() => setView("editProfile")} className="btn-edit">Chỉnh Sửa Thông Tin</button>
                        <button onClick={() => setView("password")} className="btn-change-password">Đổi Mật Khẩu</button>
                    </div>
                </>
            ) : view === "editProfile" ? (
                <>
                    <h2>Chỉnh Sửa Thông Tin</h2>
                    <form onSubmit={handleProfileSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="name">Họ và Tên:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleProfileChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleProfileChange}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số Điện Thoại:</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang Cập Nhật...' : 'Cập Nhật Thông Tin'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => setView("profile")}>Hủy</button>
                    </form>
                </>
            ) : (
                <>
                    <h2>Đổi Mật Khẩu</h2>
                    <form onSubmit={handlePasswordSubmit} className="password-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Mật Khẩu Hiện Tại:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">Mật Khẩu Mới:</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Xác Nhận Mật Khẩu Mới:</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                value={passwordData.confirmNewPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang Cập Nhật...' : 'Cập Nhật Mật Khẩu'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => setView("profile")}>Hủy</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default UserProfile;
