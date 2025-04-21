import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/searchpage.css'
const SearchPage = () => {
  const { tentimkiem } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
      event.preventDefault();
      const tentimkiem = event.target.elements.q.value;
      navigate(`/search/${tentimkiem}`);
  };
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios.get(`${process.env.REACT_APP_API_BASE_URL}/search/${tentimkiem}`)
      .then((res) => {
        setRelatedProducts(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setError("Không tìm thấy sản phẩm nào phù hợp.");
        setLoading(false);
      });
  }, [tentimkiem]);

  return (
    <div className='container'>
      <div className="list-productRelated clearfix check-1">
        <div className="heading-title text-center">
          <h2>Tìm Kiếm</h2>
          <div className="row">
            {loading ? (
              <p>Đang tải...</p>
            ) : error ?(
              <div className="expanded-message text-center">
                <h3>Không tìm thấy nội dung bạn yêu cầu</h3>
                <div className="subtext">
                  <span>Không tìm thấy <strong> "{tentimkiem}"</strong>. </span>
                  <span>Vui lòng kiểm tra chính tả, sử dụng các từ tổng quát hơn và thử lại!</span>
                </div>
                <div className="header-upper-search-top hidden-xs hidden-sm">
                  <div className="header-search">
                      <div className="search-box wpo-wrapper-search">
                          <form onSubmit={handleSubmit}>                          
                            <input type="text" name="q" placeholder="Tìm kiếm sản phẩm..." />
                            <button type="submit" className='search-again'><i class="bi bi-search"></i></button>
                          </form>
                      </div>
                  </div>
                </div>
              </div>

            ) : (
              <>
                <div className='searchKQ'>
                  <span>Kết quả tìm kiếm cho <strong>"{tentimkiem}"</strong>. </span>
                </div>                
                {relatedProducts.map((product) => {                  
                  return(
                    <div key={product.id} className="product-card">
                      <div className="product-image-container">
                        <a href={`/chitietsanpham/${product.id}`} title={product.tenSP} className="product-image-link">
                          <img className="product-image" src={`${product.hinh_anh}`} alt={product.tenSP} />
                        </a>
                      </div>
                      <div className="product-info-container">
                        <h3 className="product-name">
                          <a href={`/chitietsanpham/${product.id}`} title={product.tenSP}>{product.tenSP}</a>
                        </h3>
                        <div className="product-price">
                          <span className="current-price">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                          </span>
                          {product.gia && (
                            <span className="original-price">
                              <del>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}</del>
                            </span>
                          )}
                        </div>
                        <div className="product-actions-container">
                          <a href={`/chitietsanpham/${product.id}`} className="btn btn-detail">Xem Chi Tiết</a>
                        </div>
                      </div>
                    </div>
                 ) 
                }    
              )}
              </>
              
            )}
          </div>
        </div>
      </div>
            <div className="flex_content services-pd site-animation">
            <div className="services">
                <div className="img-outer">
                    <div className="service-img fade-box">
                        <img width="50" height="50" src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_1_thumb.png?v=377" alt="Giao Hàng &amp; Lắp Đặt"/>
                    </div>
                </div>
                <div className="text">
                    <div className="title">Giao Hàng &amp; Lắp Đặt</div>
                    <div className="desc">Miễn Phí</div>
                </div>
            </div>
            <div className="services">
                <div className="img-outer">
                    <div className="service-img fade-box">
                        <img width="50" height="50" src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_2_thumb.png?v=377" alt="Đổi Trả 1 - 1"/>
                    </div>
                </div>
                <div className="text">
                    <div className="title">Đổi Trả 1 - 1</div>
                    <div className="desc">Miễn Phí</div>
                </div>
            </div>
            <div className="services">
                <div className="img-outer">
                    <div className="service-img fade-box">
                        <img width="50" height="50" src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_3_thumb.png?v=377" alt="Bảo Hành 2 Năm"/>
                    </div>
                </div>
                <div className="text">
                    <div className="title">Bảo Hành 2 Năm</div>
                    <div className="desc">Miễn Phí</div>
                </div>
            </div>
            <div className="services">
                <div className="img-outer">
                    <div className="service-img fade-box">
                        <img width="50" height="50" src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_4_thumb.png?v=377" alt="Tư Vấn Thiết Kế"/>
                    </div>
                </div>
                <div className="text">
                    <div className="title">Tư Vấn Thiết Kế</div>
                    <div className="desc">Miễn Phí</div>
                </div>
            </div>
          </div>
    </div>
  );
};

export default SearchPage;
