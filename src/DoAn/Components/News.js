import React, { useState, useEffect } from 'react';
import axios from 'axios';
import parse from 'html-react-parser';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import LatestNews from './LatestNews';
import '../css/news.css';
import _ from 'lodash';
import { format } from 'date-fns';

const News = () => {
  const [tintuc, setTintuc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tin-tuc`);
        setTintuc(res.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchNews();
  }, []);

  const indexOfLastNew = currentPage * newsPerPage;
  const indexOfFirstNew = indexOfLastNew - newsPerPage;
  const currentNews = tintuc.slice(indexOfFirstNew, indexOfLastNew);

  const handleViewCount = async (id) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/tin-tuc-chi-tiet/${id}/increase-view`);
    } catch (error) {
      console.error("Error increasing view count: ", error);
    }
  };

  return (
    <div className='container'>
      <div className='news-container'>
        <div className="main-content">          
          <div className="news-grid">
            {currentNews.length > 0 ? currentNews.map((newsItem) => (
              <article key={newsItem.id} className="news-article">
                <div className="news-post">
                  <div className="news-thumbnail">
                    <Link 
                      className="news-image" 
                      title={newsItem.tieu_de} 
                      to={`/chi-tiet-tin-tuc/${newsItem.id}`} 
                      onClick={() => handleViewCount(newsItem.id)}
                    >
                      <img src={newsItem.hinh_anh} alt={newsItem.tieu_de} />
                    </Link>
                  </div>
                  <div className="news-info">
                    <h3 className="news-title">
                      <Link 
                        to={`/chi-tiet-tin-tuc/${newsItem.id}`} 
                        title={newsItem.tieu_de} 
                        onClick={() => handleViewCount(newsItem.id)}
                      >
                        {newsItem.tieu_de}
                      </Link>
                    </h3>
                    <div className="news-meta">
                      <span className="news-date">{format(new Date(newsItem.ngay_dang), 'dd/MM/yyyy')}</span>
                      <span className="news-views">Lượt xem: {newsItem.luot_xem}</span>
                    </div>
                    <p className="news-excerpt">{parse(_.truncate(newsItem.noi_dung, { length: 600, omission: '...' }))}</p>
                  </div>
                </div>
              </article>
            )) : <p>Không có tin tức nào để hiển thị.</p>}
          </div>
          <Pagination
            productsPerPage={newsPerPage}
            totalProducts={tintuc.length}
            paginate={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
        <div className="sidebar">
          <LatestNews />
        </div>
      </div>
    </div>
  );
};

export default News;
