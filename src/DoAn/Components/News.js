import React, { useState, useEffect } from 'react';
import axios from 'axios';
import parse from 'html-react-parser';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import LatestNews from './LatestNews'; // Import LatestNews
import '../css/news.css';
import _ from 'lodash';
import { format } from 'date-fns';
import ServiceList from './ServiceList';

const News = () => {
  const [tintuc, setTintuc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 4;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("${process.env.REACT_APP_API_BASE_URL}/tin-tuc");
        console.log("Dữ liệu tin tức:", res.data); // Kiểm tra dữ liệu
        setTintuc(res.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchNews();
  }, []);

  // Tính toán các chỉ số cho phân trang
  const indexOfLastNew = currentPage * newsPerPage;
  const indexOfFirstNew = indexOfLastNew - newsPerPage;
  const currentNews = tintuc.slice(indexOfFirstNew, indexOfLastNew);

  // Hàm để tăng lượt xem
  const handleViewCount = async (id) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/tin-tuc-chi-tiet/${id}/increase-view`);
    } catch (error) {
      console.error("Error increasing view count: ", error);
    }
  };

  return (
    <div className='container'>
      <div className='news-container'>
        <div className="sidebar">
          <LatestNews /> {/* Sidebar hiển thị tin tức mới nhất */}
        </div>
        <div className="main-content">          
          <div className="news-content">
            <div className="news-articles">
              {currentNews.length > 0 ? currentNews.map((newsItem) => (
                <article key={newsItem.id} className="news-article">
                  <div className="news-post row">
                    <div className="news-thumbnail col-md-4 col-xs-12 col-sm-4">
                      <Link 
                        className="news-image fade-box" 
                        title={newsItem.tieu_de} 
                        to={`/chi-tiet-tin-tuc/${newsItem.id}`} 
                        onClick={() => handleViewCount(newsItem.id)} // Gọi hàm tăng lượt xem khi nhấp vào liên kết
                      >
                        <img className="lazyloaded" src={newsItem.hinh_anh} alt={newsItem.tieu_de} />
                      </Link>
                    </div>
                    <div className="news-info col-md-8 col-xs-12 col-sm-8">
                      <h3 className="news-title">
                        <Link 
                          to={`/chi-tiet-tin-tuc/${newsItem.id}`} 
                          title={newsItem.tieu_de} 
                          onClick={() => handleViewCount(newsItem.id)} // Gọi hàm tăng lượt xem
                        >
                          {newsItem.tieu_de}
                        </Link>
                      </h3>
                      <div className="news-meta">
                        <span className="news-date">{format(new Date(newsItem.ngay_dang), 'dd/MM/yyyy')}</span>
                        <span className="news-views">Lượt xem: {newsItem.luot_xem}</span>
                      </div>
                      <p className="news-excerpt">{parse(_.truncate(newsItem.noi_dung, { length: 500, omission: '...' }).replace(/\r\n|\n/g, '<br />'))}</p>
                    </div>
                  </div>
                </article>
              )) : <p>Không có tin tức nào để hiển thị.</p>}
            </div>
          </div>
          <Pagination
            productsPerPage={newsPerPage}
            totalProducts={tintuc.length}
            paginate={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
    
  );
};

export default News;
