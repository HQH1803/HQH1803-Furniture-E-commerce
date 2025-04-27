import React from 'react';
import '../css/ServiceList.css';

const ServiceList = () => {
  return (
    <div className="flex_content services-pd site-animation">
      <div className="services">
        <div className="img-outer">
          <div className="service-img fade-box">
            <img
              width="50"
              height="50"
              src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_1_thumb.png?v=377"
              alt="Giao Hàng &amp; Lắp Đặt"
            />
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
            <img
              width="50"
              height="50"
              src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_2_thumb.png?v=377"
              alt="Đổi Trả 1 - 1"
            />
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
            <img
              width="50"
              height="50"
              src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_3_thumb.png?v=377"
              alt="Bảo Hành 2 Năm"
            />
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
            <img
              width="50"
              height="50"
              src="//theme.hstatic.net/200000065946/1001187274/14/vice_item_4_thumb.png?v=377"
              alt="Tư Vấn Thiết Kế"
            />
          </div>
        </div>
        <div className="text">
          <div className="title">Tư Vấn Thiết Kế</div>
          <div className="desc">Miễn Phí</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
