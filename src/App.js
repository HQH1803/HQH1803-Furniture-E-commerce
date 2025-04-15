import React,{ useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './DoAn/contexts/CartContext';
import { UserProvider } from './DoAn/contexts/UserContext';

import MainPageAdmin from './DoAn/AdminPage/Components/MainPageAdmin';

import Header from './DoAn/Components/Header';
import Footer from './DoAn/Components/Footer';
import Home from './DoAn/Components/Home';
import AllProducts from './DoAn/Components/AllProducts';
import PhongAn from './DoAn/Components/PhongAn';
import PhongNgu from './DoAn/Components/PhongNgu';
import TuQuanAo from './DoAn/Components/TuQuanAo';
import GiuongNgu from './DoAn/Components/GiuongNgu';
import Nem from './DoAn/Components/Nem';
import PhongKhach from './DoAn/Components/PhongKhach';
import Ban from './DoAn/Components/Ban';
import Ghe from './DoAn/Components/Ghe';
import TuTivi from './DoAn/Components/TuTivi';
import PhongLamViec from './DoAn/Components/PhongLamViec';
import BanLamViec from './DoAn/Components/BanLamViec';
import GheVanPhong from './DoAn/Components/GheVanPhong';
import News from './DoAn/Components/News';
import AboutUs from './DoAn/Components/AboutUs';
import ShowRoom from './DoAn/Components/ShowRoom';
import SearchPage from './DoAn/Components/SearchPage';
import Cart from './DoAn/Components/Cart';
import ChiTietSanPham from './DoAn/Components/ChiTietSanPham';
import ProtectedRoute from './DoAn/Components/ProtectedRoute';
import Checkout from './DoAn/Components/Checkout';
import DangNhap from './DoAn/Components/DangNhap';
import DangKy from './DoAn/Components/DangKy';
import SuccessPage from './DoAn/Components/SuccessPage';
import NewsDetail from './DoAn/Components/NewsDetail';
import UserProfile from './DoAn/Components/UserProfile';
import OrderList from './DoAn/Components/OrderList';
import Favorites from  './DoAn/Components/Favorites';
import ServiceList from './DoAn/Components/ServiceList';

// Layout cho trang chính (không phải trang quản trị)
const MainLayout = ({ children }) => {
    useEffect(() => {
            // Thêm script vào head khi ở trang chủ
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.innerHTML = `
                var __vnp = {code : 23354,key:'', secret : '86e8e6c12036561a01c34eccbd535f79'};
                (function() {
                    var ga = document.createElement('script');
                    ga.type = 'text/javascript';
                    ga.async = true;
                    ga.defer = true;
                    ga.src = '//core.vchat.vn/code/tracking.js?v=91508';
                    var s = document.getElementsByTagName('script');
                    s[0].parentNode.insertBefore(ga, s[0]);
                })();
            `;
            document.head.appendChild(script);

            // Cleanup để xóa script khi rời trang
            return () => {
                document.head.removeChild(script);
            };
    }, []);
    const renderHotline = (phone, display) => (
        <div className="hotline-phone-ring-wrap">
            <div className="hotline-phone-ring">
                <div className="hotline-phone-ring-circle"></div>
                <div className="hotline-phone-ring-circle-fill"></div>
                <div className="hotline-phone-ring-img-circle">
                    <a href={`tel:${phone}`} className="pps-btn-img">
                        <img src="https://netweb.vn/img/hotline/icon.png" alt="hotline" width="50" />
                    </a>
                </div>
            </div>
            <div className="hotline-bar">
                <a href={`tel:${phone}`}>
                    <span className="text-hotline">{display}</span>
                </a>
            </div>
        </div>
    );

    return (
        <div>
            <Header />
            {renderHotline('0336657490', '03 3665 7490')}
            <div className="float-icon-hotline">
                <ul className="left-icon hotline">
                    <li className="hotline_float_icon">
                        <a target="_blank" rel="nofollow" href="https://zalo.me/0336657490">
                            <i className="fa fa-zalo animated infinite tada"></i><span>Zalo</span>
                        </a>
                    </li>
                    <li className="hotline_float_icon">
                        <a target="_blank" rel="nofollow" href="https://www.messenger.com/t/61566505845360">
                            <i className="fa fa-messenger animated infinite tada"></i><span>Facebook</span>
                        </a>
                    </li>
                </ul>
            </div>
            <main>{children}</main>            
            <ServiceList/>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <Router>
            <UserProvider>
                <CartProvider>
                    <Routes>
                        {/* Route cho trang chủ */}
                        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                        <Route path="/dangnhap" element={<MainLayout><DangNhap /></MainLayout>} />
                        <Route path="/dangky" element={<MainLayout><DangKy /></MainLayout>} />
                        <Route path="/sanphams/tat-ca-san-pham" element={<MainLayout><AllProducts /></MainLayout>} />
                        <Route path="/sanphams/phong-an" element={<MainLayout><PhongAn /></MainLayout>} />
                        <Route path="/sanphams/phong-ngu" element={<MainLayout><PhongNgu /></MainLayout>} />
                        <Route path="/sanphams/2/tu" element={<MainLayout><TuQuanAo /></MainLayout>} />
                        <Route path="/sanphams/2/giuong" element={<MainLayout><GiuongNgu /></MainLayout>} />
                        <Route path="/sanphams/2/nem" element={<MainLayout><Nem /></MainLayout>} />
                        <Route path="/sanphams/phong-khach" element={<MainLayout><PhongKhach /></MainLayout>} />
                        <Route path="/sanphams/1/ban" element={<MainLayout><Ban /></MainLayout>} />
                        <Route path="/sanphams/1/ghe" element={<MainLayout><Ghe /></MainLayout>} />
                        <Route path="/sanphams/1/tu" element={<MainLayout><TuTivi /></MainLayout>} />
                        <Route path="/sanphams/phong-lam-viec" element={<MainLayout><PhongLamViec /></MainLayout>} />
                        <Route path="/sanphams/3/ban" element={<MainLayout><BanLamViec /></MainLayout>} />
                        <Route path="/sanphams/3/ghe" element={<MainLayout><GheVanPhong /></MainLayout>} />        
                        <Route path="/tintuc" element={<MainLayout><News /></MainLayout>} />
                        <Route path="/thongtincanhan" element={<MainLayout><UserProfile/></MainLayout>} />
                        <Route path="/danhsachdonhang" element={<MainLayout><OrderList/></MainLayout>} />
                        <Route path="/yeuthich" element={<MainLayout><Favorites/></MainLayout>} />
                        <Route path="/chi-tiet-tin-tuc/:id" element={<MainLayout><NewsDetail /></MainLayout>}/> 
                        <Route path="/about-us" element={<MainLayout><AboutUs /></MainLayout>} />
                        <Route path="/showroom" element={<MainLayout><ShowRoom /></MainLayout>} />
                        <Route path="/search/:tentimkiem" element={<MainLayout><SearchPage /></MainLayout>} />
                        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
                        <Route path="/chitietsanpham/:id" element={<MainLayout><ChiTietSanPham /></MainLayout>} />
                        <Route path="/checkout" element={<MainLayout><Checkout/></MainLayout>} />
                        <Route path="/successpage" element={<MainLayout><SuccessPage/></MainLayout>} />
                        
                        {/* Route cho trang quản trị */}
                        <Route path="/adminpage" element={
                            <ProtectedRoute>
                                <MainPageAdmin />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </CartProvider>
            </UserProvider>
        </Router>
    );
}

export default App;
