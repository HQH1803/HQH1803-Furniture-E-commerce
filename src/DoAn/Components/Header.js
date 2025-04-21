import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import removeAccents from 'remove-accents';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import '../css/header.css';
import '../css/all.css';

const Header = () => {
    const navigate = useNavigate();
    const { cart } = useCart();
    const { customerUser,logout} = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);
    const [categories, setCategories] = useState([]);

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

    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn trình duyệt tải lại trang
        const searchQuery = e.target.q.value.trim(); // Lấy giá trị ô input và loại bỏ khoảng trắng
    
        if (!searchQuery) {
            alert("Vui lòng nhập từ khóa tìm kiếm!"); // Hiển thị thông báo lỗi
            return; // Ngừng xử lý nếu ô tìm kiếm để trống
        }
    
        navigate(`/search/${searchQuery}`);
        // Gọi API hoặc điều hướng trang kết quả tìm kiếm
    };
    
    useEffect(() => {
        const handleScroll = () => {
            const currentPosition = window.pageYOffset;
            setIsHeaderFixed(currentPosition > 350);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

  
    return (
        <header className={`header ${isHeaderFixed ? 'header-fixed' : ''}`}>
            <div className="header-main">
                <Link to="/" aria-label="logo" style={{ width: '8%' }}>
                    <img src={require("../images/Logo/logo1.png")} alt="Nội Thất Tinie" />
                </Link>
                <form className="search-bar" onSubmit={handleSubmit}>
                    <input type="text" name="q" placeholder="Tìm kiếm sản phẩm..." />
                    <button type="submit"><i className="bi bi-search"></i></button>
                </form>
                <div className="header-right">
                    {customerUser ? (
                        <div className="user-dropdown">
                            <button className="user-dropdown-button" onClick={toggleMenu}>
                                {customerUser.ho_ten || 'Tên người dùng'}
                                <i className={`bi bi-chevron-${menuOpen ? 'up' : 'down'}`}></i>
                            </button>
                            <div className={`user-dropdown-menu ${menuOpen ? 'open' : ''}`}>
                                <Link to="/thongtincanhan" className="dropdown-item">Thông Tin Cá Nhân</Link>
                                <Link to="/danhsachdonhang" className="dropdown-item">Xem Đơn Hàng</Link>
                                <Link to="/yeuthich" className="dropdown-item">Danh Sách Yêu Thích</Link>
                                <button  onClick={() => logout('customer')} className="logout-button">Đăng Xuất</button>
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
                </div>
            </div>
            <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <ul className="menuList-main">
                    <li className="has-submenu levl-1">
                        <Link to="#" title="Danh Mục"> 
                            Danh Mục
                            <i className="bi bi-chevron-down"></i>
                        </Link>
                        <ul className="menuList-submain level-1">
                            {categories.map((category) => (
                                <li className="has-submenu levl-2" key={category.LoaiPhongID}>
                                    <Link to={`/sanphams/${removeAccents(category.LoaiPhong.toLowerCase().replace(/\s+/g, '-'))}`} title={category.LoaiPhong}>
                                        {category.LoaiPhong} 
                                        {/* Nếu không phải 'Phòng ăn' mới hiển thị biểu tượng */}
                                        {category.LoaiPhong !== 'Phòng ăn' && <i className="bi bi-chevron-right"></i>}
                                    </Link>
                                    {category.LoaiPhong !== 'Phòng ăn'&&category.SanPham && (
                                        <ul className="menuList-submain level-2">
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
                    <li className="has-submenu levl-1">
                        <Link to="/sanphams/tat-ca-san-pham" title="Tất Cả Sản phẩm"> 
                            Tất Cả Sản phẩm
                        </Link>
                    </li>
                    <li className="has-submenu active levl-1">
                        <Link to="/tintuc" title="Tin Tức"> 
                            Tin Tức
                        </Link>
                    </li>
                    <li className="has-submenu active levl-1">
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
