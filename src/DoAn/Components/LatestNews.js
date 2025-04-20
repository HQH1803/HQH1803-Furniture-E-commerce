import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { format } from 'date-fns';

const LatestNews = () => {
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await api.get('/api/tin-tuc-moi-nhat');
        setLatestNews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching latest news:', error);
        setError('Could not load latest news.');
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="latest-news">
      <h3>Tin Tức Mới Nhất</h3>
      <ul>
        {latestNews.map((news) => (
          <li key={news.id}>
            <Link to={`/chi-tiet-tin-tuc/${news.id}`}>
              <div className="latest-news-item">
                <img src={news.hinh_anh} alt={news.tieu_de} />
                <div className="latest-news-info">
                  <h4>{news.tieu_de}</h4>
                  <span className="news-date">{format(new Date(news.ngay_dang), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestNews;
