import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { useUser } from '../contexts/UserContext'; 
import "../css/review.css";

const ReviewForm = ({ productId }) => {
    const { customerUser} = useUser();  // Access both admin and customer users from UserContext

    const [rating, setRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalPages, setTotalPages] = useState(1); 
    const reviewsPerPage = 9; 
    const [sortOrder, setSortOrder] = useState('newest'); // State for sorting order

    useEffect(() => {
        if (customerUser) {
            setName(customerUser.ho_ten);
            setEmail(customerUser.email);
        }
    }, [customerUser]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!customerUser) {
            message.error('Vui lòng đăng nhập');
            return;
        }
        // Validate required fields
        if (!name || !email || !reviewContent) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        // Validate word count
        const wordCount = reviewContent.trim().split(/\s+/).length; // Split by whitespace and count words
        if (wordCount > 70) {
            setError('Nội dung đánh giá không được vượt quá 70 từ.');
            return;
        }

        // Prepare review data
        const reviewData = {
            rate_name: name,
            rate_email: email,
            rating: rating,
            noi_dung: reviewContent,
        };

        // Send review data to the server
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/san-pham/${productId}/danh-gia`, reviewData);
            message.success("Cảm ơn bạn đã đánh giá");
            resetReviewForm(); // Reset the form
            fetchReviews(); // Lấy lại danh sách đánh giá mới sau khi gửi
        } catch (error) {
            console.error('Error submitting review:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const fetchReviews = async (page = 1, sortOrder = 'newest') => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/san-pham/${productId}/danh-gia`, {
                params: { page, limit: reviewsPerPage, sortOrder }  // Pass sortOrder as a query parameter
            });
            console.log('API Response:', response.data);
    
            // Destructure reviews and total pages from response data
            const { reviews: fetchedReviews, totalPages } = response.data;
    
            // Set reviews and total pages state
            setReviews(Array.isArray(fetchedReviews) ? fetchedReviews : []);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            message.error('Có lỗi xảy ra khi tải danh sách đánh giá!');
        }
    };
    
    // Call fetchReviews when sortOrder changes or when the page changes
    useEffect(() => {
        fetchReviews(currentPage, sortOrder);
    }, [productId, currentPage, sortOrder]);
    
    
    

    const resetReviewForm = () => {
        setRating(5);
        setReviewContent('');
        setError('');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1); // Reset to first page when changing sort order
    };

    useEffect(() => {
        fetchReviews(currentPage);
    }, [productId, currentPage]);

    // Sắp xếp đánh giá
    const sortedReviews = [...reviews].sort((a, b) => {
        const dateA = new Date(a.created_at); 
        const dateB = new Date(b.created_at);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB; // Sắp xếp theo ngày
    });

    return (
        <div className="review-form">
            <h3>Đánh giá của bạn về sản phẩm này</h3>
            <div className="rating">
                {Array.from({ length: 5 }, (_, index) => (
                    <span
                        key={index}
                        className={index < rating ? 'star filled' : 'star'}
                        onClick={() => setRating(index + 1)}
                    >
                        ★
                    </span>
                ))}
            </div>
            <form onSubmit={handleReviewSubmit} className="review-form-container">
                <div className="form-group">
                    <label htmlFor="name">Họ tên:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={!!customerUser}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={!!customerUser}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="reviewContent">Nội dung đánh giá:</label>
                    <textarea
                        id="reviewContent"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        required
                        maxLength={1500}
                    ></textarea>
                    <small>{reviewContent.trim().split(/\s+/).length}/70 từ</small>
                </div>
                {error && <p className="error">{error}</p>}
                <div style={{ textAlign: "center" }}>
                    <button type="submit" className="submit-button">Gửi đánh giá</button>
                </div>
            </form>
            <h4>Danh sách đánh giá:</h4>

            {/* Thêm Dropdown để chọn sắp xếp */}
            <div className="sort-options">
                <label htmlFor="sortOrder">Sắp xếp:</label>
                <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
            </div>

            {sortedReviews.length > 0 ? (
                <div className="reviews-container">
                    {sortedReviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <h4>{review.rate_name}</h4>
                            <div className="rate_star">
                                {Array.from({ length: 5 }, (_, starIndex) => (
                                    <span
                                        key={starIndex}
                                        className={starIndex < review.rating ? 'star_db filled' : 'star_db'}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="review-content">{review.noi_dung}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            )}

            {/* Phân trang */}
            <div className="pagination-review">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReviewForm;
