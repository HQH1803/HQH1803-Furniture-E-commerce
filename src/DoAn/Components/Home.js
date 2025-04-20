import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MyCarousel from './MyCarousel';
import '../css/Home.css'
import SanPhamMoi from './SanPhamMoi';
import _ from 'lodash';
function Body() {     
  const [tintuc, setTintuc] = useState([]);
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await axios.get("http://furniture-e-commerce-wt2i.onrender.com/api/tin-tuc");
        const sortedNews = response.data.sort((a, b) => new Date(b.ngay_dang) - new Date(a.ngay_dang));
        setTintuc(sortedNews.slice(0, 4)); // Lấy 4 tin tức mới nhất
      } catch (error) {
        console.error("Error fetching latest news: ", error);
      }
    };
    fetchLatestNews();
  }, []);

  const handleViewCount = async (id) => {
    try {
      await axios.post(`http://furniture-e-commerce-wt2i.onrender.com/api/tin-tuc-chi-tiet/${id}/increase-view`);
    } catch (error) {
      console.error("Error increasing view count: ", error);
    }
  };
  return (
    <div>
      <MyCarousel />
      <div className='container'>
        <div className="wrapper-heading-home">
          <h2>
            Không Gian Sống Với Tinie
          </h2>
          <div className="row">
            <div className="col-md-4 col-xs-12 col-sm-4 padding-img">
              <div className="row">
                <div className="fade-out col-md-12 col-xs-6 col-sm-12 no_pdr fade-box">
                  <a href="/sanphams/phong-khach" className="fadeoutcenter">
                    <img width="360" height="357" srcset="//theme.hstatic.net/200000065946/1001187274/14/imgaView1_large.jpg?v=377 412w, //theme.hstatic.net/200000065946/1001187274/14/imgaView1.jpg?v=377" alt="nội thất phòng khách"/>
                  </a>
                </div>
                <div className="col-md-12 col-xs-6 col-sm-12 no_pdr padding-img fade-box">
                  <div className="fade-out">
                    <a href="/sanphams/phong-ngu" className="fadeoutcenter">
                      <img width="360" height="357" srcset="//theme.hstatic.net/200000065946/1001187274/14/imgaView2_large.jpg?v=377 412w, //theme.hstatic.net/200000065946/1001187274/14/imgaView2.jpg?v=377" alt="nội thất phòng ngủ"/>
                    </a>	
                  </div>
                </div>
              </div>	
            </div>
            <div className="col-md-8 col-xs-12 col-sm-8 padding-img fade-box">
              <div className="fade-out">
                <a href="#" className="fadeoutcenter">
                  <img width="750" height="430" srcset="//theme.hstatic.net/200000065946/1001187274/14/imgaView3_large.jpg?v=377 412w, //theme.hstatic.net/200000065946/1001187274/14/imgaView3.jpg?v=377" alt="Trọn bộ nội thất"/>
                </a>
              </div>
              <div className="row">
                <div className="col-md-6 col-xs-6 col-sm-6 padding-img pd_lr fade-box">
                  <div className="fade-out">
                    <a href="/sanphams/phong-an" className="fadeoutcenter">
                      <img width="400" height="314" srcset="//theme.hstatic.net/200000065946/1001187274/14/imgaView4_large.jpg?v=377 412w, //theme.hstatic.net/200000065946/1001187274/14/imgaView4.jpg?v=377" alt="nội thất phòng ăn"/>
                    </a> 
                  </div>
                </div>
                <div className="col-md-6 col-xs-6 col-sm-6 padding-img pd_lr fade-box">
                  <div className="fade-out">
                    <a href="/sanphams/phong-an" className="fadeoutcenter">
                      <img width="400" height="314" srcset="//theme.hstatic.net/200000065946/1001187274/14/imgaView5_large.jpg?v=377 412w, //theme.hstatic.net/200000065946/1001187274/14/imgaView5.jpg?v=377" alt="tủ bếp moho"/>
                    </a>
                  </div>
                </div>
              </div>
            </div>            
          </div>
          <SanPhamMoi/>
          
          <div className="site-animation">
            <h2>TIN TỨC MỚI NHẤT</h2>
            <span className="view-more">
              <a href="/tintuc"> Xem thêm </a>
            </span>
          </div>
          <div className="row">
            {tintuc.map((news) => {
              const truncatedTitle = news.tieu_de.split(' ').slice(0, 20).join(' ');              
              const truncatedContent = news.noi_dung.split(' ').slice(0, 20).join(' ');               
              return (
                <div key={news.id} className="col-md-3 col-sm-6">
                  <div className="news-card">
                      <Link 
                        className="news-image fade-box" 
                        title={news.tieu_de} 
                        to={`/chi-tiet-tin-tuc/${news.id}`} 
                        onClick={() => handleViewCount(news.id)} // Gọi hàm tăng lượt xem khi nhấp vào liên kết
                      >
                        <img className="lazyloaded" src={news.hinh_anh} alt={news.tieu_de} />
                      </Link>
                    <div className="news-info">
                    <h3 className="news-title">
                        <Link 
                          to={`/chi-tiet-tin-tuc/${news.id}`} 
                          title={news.tieu_de} 
                          onClick={() => handleViewCount(news.id)} // Gọi hàm tăng lượt xem
                        >
                          {(_.truncate(news.tieu_de, { length: 44, omission: '...' }).replace(/\r\n|\n/g, '<br />'))}
                        </Link>
                      </h3>
                      <div className="news-content" dangerouslySetInnerHTML={{ __html: truncatedContent }}></div>
                      <p className="news-date">{news.ngay_dang}</p>
                    </div>
                  </div>
                </div>        
              );
            })}
          </div>
        </div>        
      </div>      
    </div>
  );
}

export default Body;
