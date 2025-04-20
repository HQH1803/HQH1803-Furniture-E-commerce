import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu trữ thông tin người dùng đăng nhập

    const signIn = async (email, password) => {
        try {
            const response = await fetch('http://furniture-e-commerce-wt2i.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            if (!response.ok) {
                throw new Error('Đăng nhập thất bại');
            }
    
            const data = await response.json();
            setUser(data.user); // Lưu thông tin người dùng vào state
            localStorage.setItem('token', data.token); // Lưu token vào localStorage hoặc sessionStorage
    
            return data;
        } catch (error) {
            throw error;
        }
    };
    

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('token'); // Xóa token khi đăng xuất
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
