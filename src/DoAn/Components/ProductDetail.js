import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import config from '../../config/config';
import { toast } from 'react-toastify';

const fetchProduct = async () => {
    try {
        const response = await api.get(config.endpoints.products.getById(id));
        setProduct(response.data);
    } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
    }
};

const fetchFavorites = async () => {
    try {
        const response = await api.get(config.endpoints.favorites.get(customerUser.email));
        setFavorites(response.data);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Không thể tải danh sách yêu thích');
    }
};

const handleAddToFavorites = async () => {
    try {
        if (favorites.some(fav => fav.product_id === product.id)) {
            await api.delete(config.endpoints.favorites.delete(customerUser.email, product.id));
            setFavorites(favorites.filter(fav => fav.product_id !== product.id));
            toast.success('Đã xóa khỏi danh sách yêu thích');
        } else {
            const response = await api.post(config.endpoints.favorites.add, {
                customer_email: customerUser.email,
                product_id: product.id
            });
            setFavorites([...favorites, response.data]);
            toast.success('Đã thêm vào danh sách yêu thích');
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        toast.error('Không thể cập nhật danh sách yêu thích');
    }
}; 