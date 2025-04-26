import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import removeAccents from 'remove-accents';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import '../css/header.css';
import '../css/all.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart } = useCart();
    const { customerUser, logout } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);
    const [categories, setCategories] = useState([]);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);

    // Đóng menu khi route thay đổi
    useEffect(() => {
        setMenuOpen(false);
        setUserMenuOpen(false);
        setCategoryMenuOpen(false);
        setActiveSubmenu(null);
    }, [location.pathname]);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/danh-sach-phong`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchData();
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    const toggleCategoryMenu = (e) => {
        e.preventDefault();
        setCategoryMenuOpen(!categoryMenuOpen);
        setActiveSubmenu(null);
    };

    const toggleSubmenu = (e, categoryId, categoryName) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (activeSubmenu === categoryId) {
            // Nếu submenu đang mở, chuyển hướng đến trang phòng
            navigate(`/sanphams/${removeAccents(categoryName.toLowerCase().replace(/\s+/g, '-'))}`);
            setCategoryMenuOpen(false);
            setActiveSubmenu(null);
        } else {
            // Nếu submenu chưa mở, mở submenu
            setActiveSubmenu(categoryId);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const searchQuery = e.target.q.value.trim();
    
        if (!searchQuery) {
            alert("Vui lòng nhập từ khóa tìm kiếm!");
            return;
        }
    
        navigate(`/search/${searchQuery}`);
    };
    
    useEffect(() => {
        const handleScroll = () => {
            const currentPosition = window.pageYOffset;
            setIsHeaderFixed(currentPosition > 350);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuOpen && !event.target.closest('.user-dropdown')) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [userMenuOpen]);

    return (
        <header className={`header ${isHeaderFixed ? 'header-fixed' : ''}`}>
            <div className="header-main">
                <Link to="/" className="logo">
                    <img src={require("../images/Logo/logo1.png")} alt="Nội Thất Tinie" />
                </Link>

                <form className="search-bar" onSubmit={handleSubmit}>
                    <input type="text" name="q" placeholder="Tìm kiếm sản phẩm..." />
                    <button type="submit"><i className="bi bi-search"></i></button>
                </form>

                <div className="header-right">
                    {customerUser ? (
                        <div className="user-dropdown">
                            <button className="user-dropdown-button" onClick={toggleUserMenu}>
                                {customerUser.ho_ten || 'Tên người dùng'}
                                <i className={`bi bi-chevron-${userMenuOpen ? 'up' : 'down'}`}></i>
                            </button>
                            <div className={`user-dropdown-menu ${userMenuOpen ? 'open' : ''}`}>
                                <Link to="/thongtincanhan" className="dropdown-item">Thông Tin Cá Nhân</Link>
                                <Link to="/danhsachdonhang" className="dropdown-item">Xem Đơn Hàng</Link>
                                <Link to="/yeuthich" className="dropdown-item">Danh Sách Yêu Thích</Link>
                                <button onClick={() => logout('customer')} className="logout-button">Đăng Xuất</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/dangnhap" className="login-link">Login</Link>
                            <Link to="/dangky" className="register-link">Register</Link>
                        </>
                    )}

                    <div className="cart-icon">
                        <Link to="/cart">
                            <i className="bi bi-cart3"></i>
                            <span className="cart-count">{cart.length}</span>
                        </Link>
                    </div>

                    <div className="menu-icon" onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>

            <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
                <ul className="menuList-main">
                    <li className="has-submenu">
                        <Link to="#" title="Danh Mục" onClick={toggleCategoryMenu}>
                            Danh Mục
                            <i className={`bi bi-chevron-${categoryMenuOpen ? 'up' : 'down'}`}></i>
                        </Link>
                        <ul className={`menuList-submain ${categoryMenuOpen ? 'show' : ''}`}>
                            {categories.map((category) => (
                                <li className="has-submenu" key={category.LoaiPhongID}>
                                    <Link 
                                        to="#" 
                                        onClick={(e) => toggleSubmenu(e, category.LoaiPhongID, category.LoaiPhong)}
                                        title={category.LoaiPhong}
                                    >
                                        {category.LoaiPhong}
                                        {category.LoaiPhong !== 'Phòng ăn' && (
                                            <i className={`bi bi-chevron-${activeSubmenu === category.LoaiPhongID ? 'down' : 'right'}`}></i>
                                        )}
                                    </Link>
                                    {category.LoaiPhong !== 'Phòng ăn' && category.SanPham && (
                                        <ul className={`menuList-submain level-2 ${activeSubmenu === category.LoaiPhongID ? 'show' : ''}`}>
                                            {category.SanPham.split(', ').map((item) => {
                                                const [id, name] = item.split(':');
                                                return (
                                                    <li key={id}>
                                                        <Link 
                                                            to={`/sanphams/${category.LoaiPhongID}/${removeAccents(name.toLowerCase().replace(/\s+/g, '-'))}`}
                                                            title={name}
                                                        >
                                                            {name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li>
                        <Link to="/sanphams/tat-ca-san-pham" title="Tất Cả Sản phẩm">
                            Tất Cả Sản phẩm
                        </Link>
                    </li>
                    <li>
                        <Link to="/tintuc" title="Tin Tức">
                            Tin Tức
                        </Link>
                    </li>
                    <li>
                        <Link to="/showroom" title="Showroom">
                            Showroom
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
