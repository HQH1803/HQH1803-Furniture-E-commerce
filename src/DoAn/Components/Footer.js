import React, { useState } from 'react';
import '../css/footer.css';

const Footer = () => {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-section col-xs-12 col-sm-6 col-md-3 col-bd">
                        <h4 
                            className={`footer-title ${openSections['about'] ? 'active' : ''}`}
                            onClick={() => toggleSection('about')}
                        >
                            NỘI THẤT Tinie
                            <span className="dropdown-icon"></span>
                        </h4>
                        <div className={`footer-content ${openSections['about'] ? 'show' : ''}`}>
                            <p>Nội Thất Tinie là thương hiệu đến từ Savimex với gần 40 năm kinh nghiệm trong việc sản xuất và xuất khẩu nội thất đạt chuẩn quốc tế.</p>
                            <div className="fBlock-logo-bct">
                                <a href="#" className="fade-box" aria-label="Bộ Công Thương">
                                    <img src="//theme.hstatic.net/200000065946/1001187274/14/logo_bct.png?v=344" alt="Bộ Công Thương" />
                                </a>
                            </div>
                            <a href="#" title="DMCA.com Protection Status" className="dmca-badge">
                                <img src="https://images.dmca.com/Badges/dmca_protected_18_120.png?ID=c870a589-fd82-4c14-9e41-c3891ec42fb5" alt="DMCA.com Protection Status" />
                            </a>
                        </div>
                    </div>

                    <div className="footer-section col-xs-12 col-sm-6 col-md-3 col-bd">
                        <h4 
                            className={`footer-title ${openSections['service'] ? 'active' : ''}`}
                            onClick={() => toggleSection('service')}
                        >
                            DỊCH VỤ
                            <span className="dropdown-icon"></span>
                        </h4>
                        <div className={`footer-content ${openSections['service'] ? 'show' : ''}`}>
                            <ul>
                                <li><a href='#'>Chính Sách Bán Hàng</a></li>
                                <li><a href='#'>Chính Sách Giao Hàng & Lắp Đặt</a></li>
                                <li><a href='#'>Chính Sách Đổi Trả</a></li>
                                <li><a href='#'>Chính Sách Bảo Hành & Bảo Trì</a></li>
                                <li><a href='#'>Khách Hàng Thân Thiết</a></li>
                                <li><a href='#'>Chính Sách Đối Tác Bán Hàng</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-section col-xs-12 col-sm-6 col-md-3 col-bd">
                        <h4 
                            className={`footer-title ${openSections['contact'] ? 'active' : ''}`}
                            onClick={() => toggleSection('contact')}
                        >
                            THÔNG TIN LIÊN HỆ
                            <span className="dropdown-icon"></span>
                        </h4>
                        <div className={`footer-content ${openSections['contact'] ? 'show' : ''}`}>
                            <div className='footer-contact'>
                                <ul>
                                    <li className='contact-1'>Showroom: 162 HT17, P. Hiệp Thành, Q. 12, TP. HCM (Nằm trong khuôn viên công ty SAVIMEX phía sau bến xe buýt Hiệp Thành)</li>
                                    <li>Hotline: 0971 141 140</li>                        
                                    <li className='contact-3'>cskh@moho.com.vn</li>
                                    <li>Công Ty Cổ Phần Hợp Tác Kinh Tế Và Xuất Nhập Khẩu Savimex - STK: 0071001303667 - Vietcombank CN HCM</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col-md-12">
                        <div className="footer-follow-us">
                            <ul className="infoList-social social-icons">
                                <li className="link-facebook hidden-lg hidden-md">
                                    <a href="https://www.facebook.com/profile.php?id=61566505845360" rel="noreferrer" className="fa fa-facebook" aria-label="facebook">
                                        <img alt="Facebook" style={{ transform: "translateY(-2px)" }} src={require("../images/iconFB.png")} />
                                    </a>
                                </li>
                                <li className="link-youtube">
                                    <a href="https://www.youtube.com/channel/UChrgCVzBmKda-7Q8MYFnSeg/featured" target="_blank" rel="noreferrer" className="fa fa-youtube" aria-label="youtube">
                                        <img alt="Youtube" style={{ transform: "translateY(-2px)" }} src={require("../images/iconYT.png")}/>
                                    </a>
                                </li>
                                <li className="link-instagram">
                                    <a href="https://www.instagram.com/mohofurniture/" target="_blank" rel="noreferrer" className="fa" aria-label="instagram">
                                        <img alt="Instagram" style={{ transform: "translateY(-2px)" }} src={require("../images/logoInsta.webp")} />
                                    </a>
                                </li>
                                <li className="link-tiktok">
                                    <a href="https://www.tiktok.com/@mohofurniture" target="_blank" rel="noreferrer" className="fa " aria-label="tiktok">
                                        <img alt="Tiktok" style={{ transform: "translateY(-2px)" }} src={require("../images/logoTikTok.webp")} />
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="footer-menu-aboutus">
                            <ul className="menuList-footer">
                                <li className="item">
                                    <a href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x317529a12d82e2df:0x569afdd3c76bcbbc?source=g.page.share" target="_blank" title="Chỉ đường đến showroom trên Google Maps">Chỉ đường đến showroom trên Google Maps</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>           
            </div>    
            <div className="footer-bottom text-center">
                <div className="container">
                    <p>Copyright © 2024 <a href="/"> Nội Thất Tinie</a>.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
