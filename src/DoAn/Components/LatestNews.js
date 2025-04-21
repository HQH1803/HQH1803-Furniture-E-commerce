import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Để định dạng ngày
import _ from 'lodash';
const LatestNews = () => {
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await axios.get("${process.env.REACT_APP_API_BASE_URL}/tin-tuc");
        const sortedNews = response.data.sort((a, b) => new Date(b.ngay_dang) - new Date(a.ngay_dang));
        setLatestNews(sortedNews.slice(0, 5)); // Lấy 5 tin tức mới nhất
      } catch (error) {
        console.error("Error fetching latest news: ", error);
      }
    };

    fetchLatestNews();
  }, []);

  return (
    <div >
      <h2>Tin Mới Nhất</h2>
      <ul>
        {latestNews.map(news => (
          <li key={news.id} className="latest-news-item">
            <Link to={`/chi-tiet-tin-tuc/${news.id}`}>              
              <img src={news.hinh_anh} alt={news.tieu_de} />
              <div className="latest-news-content">
                <h3 className="news-excerpt">{(_.truncate(news.tieu_de, { length: 30, omission: '...' }).replace(/\r\n|\n/g, '<br />'))}</h3>
                <span className="date">{format(new Date(news.ngay_dang), 'dd/MM/yyyy')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestNews;
