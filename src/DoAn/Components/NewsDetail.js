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
    const { id } = useParams(); // Get the article ID from the URL
    const [newsItem, setNewsItem] = useState(null);
    const articleUrl = `${process.env.REACT_APP_API_BASE_URL}/chi-tiet-tin-tuc/${id}`;
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/tin-tuc-chi-tiet/${id}`)
            .then((res) => {
                setNewsItem(res.data);
            })
            .catch((error) => console.error("Error fetching data: ", error));
    }, [id]);
    
    useEffect(() => {
        // Re-initialize Facebook comments plugin after Facebook SDK is loaded
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      }, [id]); // Re-run when productId changes

    if (!newsItem) return <div>Loading...</div>;

    return (
        <div className='container'>
            <div className="news-detail-page">
                <div className="sidebar">
                    <LatestNews /> {/* Sidebar with the latest news */}
                </div>
                <div className="main-content-new">
                    <div className="news-detail-container">
                        <h1 className="news-title">{newsItem.tieu_de}</h1>
                        <div className="news-meta">
                            <div className="news-date">{format(new Date(newsItem.ngay_dang), 'dd/MM/yyyy')}</div>
                            
                            {/* Facebook Share Button */}                
                            
                             <FacebookSDK />            
                            <div className="news-views">Lượt xem: {newsItem.luot_xem} 
                            </div>
                            
                            
                        </div>
                        <div>
                                <span className="fb-share-button" 
                                    data-href={articleUrl}  
                                    data-size="large">
                                    <a 
                                        target="_blank" 
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`} 
                                        className="fb-xfbml-parse-ignore">
                                    </a>
                                </span>
                            </div>
                        <div className="news-content">
                            {parse(newsItem.noi_dung)}
                        </div>
                    </div>
                </div>                
            </div>
            <div>
                <div className='title-comment' >Bình luận</div>
                <div className="fb-comments" 
                data-href={articleUrl} 
                data-width="100%" 
                data-numposts="5">
            </div>
            </div>            
            <ServiceList/>     
        </div>
    );
};

export default NewsDetail;
