import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import Pagination from './Pagination'; // Import your Pagination component
import '../css/favorites.css';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);  // To store the favorite products
    const [loading, setLoading] = useState(true);    // To show loading state
    const [error, setError] = useState(null);        // To handle errors
    const [currentPage, setCurrentPage] = useState(1);  // For current page
    const [productsPerPage] = useState(5); // Set the number of items per page (can adjust this)
    const { customerUser} = useUser();  // Access both admin and customer users from UserContext
    // Fetch the favorite products when the component mounts or when the page changes
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch(`http://furniture-e-commerce-wt2i.onrender.com/api/favorites?user_email=${customerUser?.email}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch favorites');
                }

                const data = await response.json();
                setFavorites(data); // Set the fetched favorite products
            } catch (err) {
                setError(err.message); // Handle any errors
            } finally {
                setLoading(false);  // Set loading to false after fetching
            }
        };

        fetchFavorites();
    }, [customerUser]);  // Fetch data when user changes

    const handleRemoveFavorite = async (favoriteId) => {
        try {
            const response = await fetch(`http://furniture-e-commerce-wt2i.onrender.com/api/favorites/${favoriteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove favorite');
            }

            // Update the favorites state after successful deletion
            setFavorites((prevFavorites) => 
                prevFavorites.filter((favorite) => favorite.favorite_id !== favoriteId)
            );
        } catch (err) {
            setError(err.message); // Handle any errors
        }
    };

    if (loading) return <p>Loading favorites...</p>;
    if (error) return <p>Error: {error}</p>;

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentFavorites = favorites.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <h2 className="title-favorite">Danh Sách Yêu Thích</h2>
            {favorites.length === 0 ? (
                <p>Không có sản phẩm yêu thích nào.</p>
            ) : (
                <ul>
                    {currentFavorites.map((favorite) => (
                        <li key={favorite.favorite_id} className="favorite-item">
                            {/* Hình ảnh sản phẩm */}
                            <div className="product-image">
                                {favorite.product_image && (
                                    <img 
                                        src={`${favorite.product_image}`} 
                                        alt={favorite.product_name} 
                                        width="100" // Thêm kích thước nếu cần
                                    />
                                )}
                            </div>
                            {/* Tên sản phẩm và ngày thích */}
                            <div className="favorite-product-details">
                                <div className="product-name">
                                    <p><strong>{favorite.product_name}</strong></p>
                                </div>
                                <div className="favorite-date">
                                    <p><strong>Đã thích vào lúc:</strong> {new Date(favorite.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Xem chi tiết sản phẩm */}
                            <div className="view-product">
                                <a href={`/chitietsanpham/${favorite.product_id}`} rel="noopener noreferrer">
                                    <button>Xem Chi Tiết Sản Phẩm</button>
                                </a>
                            </div>

                            {/* Nút bỏ thích */}
                            <div className="remove-favorite">
                                <button onClick={() => handleRemoveFavorite(favorite.favorite_id)}>Bỏ Thích</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Component */}
            <Pagination 
                productsPerPage={productsPerPage} 
                totalProducts={favorites.length} 
                paginate={paginate} 
                currentPage={currentPage} 
            />
        </div>
    );
};

export default Favorites;
