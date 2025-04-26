import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import { format } from 'date-fns';
import LatestNews from './LatestNews';
import '../css/news.css';
import ServiceList from './ServiceList';
import FacebookSDK from './FacebookSDK';

const NewsDetail = () => {
    const { id } = useParams();
    const [newsItem, setNewsItem] = useState(null);
    const articleUrl = `${process.env.REACT_APP_API_BASE_URL}/api/chi-tiet-tin-tuc/${id}`;
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tin-tuc-chi-tiet/${id}`)
            .then((res) => {
                setNewsItem(res.data);
            })
            .catch((error) => console.error("Error fetching data: ", error));
    }, [id]);
    
    useEffect(() => {
        if (window.FB) {
            window.FB.XFBML.parse();
        }
    }, [id]);

    if (!newsItem) return <div>Loading...</div>;

    return (
        <div className='container'>
            <div className="news-container">
                <div className="main-content">
                    <article className="news-detail-article">
                        <div className="news-detail-header">
                            <h1 className="news-detail-title">{newsItem.tieu_de}</h1>
                            <div className="news-meta">
                                <span className="news-date">
                                    {format(new Date(newsItem.ngay_dang), 'dd/MM/yyyy')}
                                </span>
                                <span className="news-views">
                                    Lượt xem: {newsItem.luot_xem}
                                </span>
                                <div className="fb-share-button" 
                                    data-href={articleUrl}  
                                    data-size="large">
                                    <a target="_blank" 
                                       href={`https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`} 
                                       className="fb-xfbml-parse-ignore">
                                        Chia sẻ
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="news-detail-content">
                            {parse(newsItem.noi_dung)}
                        </div>
                        <div className="news-detail-comments">
                            <h3 className="comments-title">Bình luận</h3>
                            <div className="fb-comments" 
                                data-href={articleUrl} 
                                data-width="100%" 
                                data-numposts="5">
                            </div>
                        </div>
                    </article>
                </div>
                <div className="sidebar">
                    <LatestNews />
                </div>
            </div>
            <ServiceList />
        </div>
    );
};

export default NewsDetail;
