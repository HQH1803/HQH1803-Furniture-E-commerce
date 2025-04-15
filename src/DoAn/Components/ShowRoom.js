import React from 'react';

function ShowRoom() {
  return (
    <div>
      <div className="paralax-container text-center">
        <div className="breadcrumb-shop">
          <h1>Showroom Nội Thất Tinie</h1>
        </div>
      </div>
      <div className='container'>
        <div className="contact-us flexMargin">
          <div className="col-md-6 col-sm-6 fade-box">
            <img
              className="ls-is-cached lazyloaded"
              src="//theme.hstatic.net/200000065946/1001187274/14/show_image_footers.jpg?v=556"
              alt="Liên hệ ngay"
            />
          </div>
          <div className="col-md-6 col-sm-6 pd_contact">
            <div className="title-info-contact">
              <h2>Experience Stores</h2>
            </div>
            <div className="box-info-contact">
              <ul className="list-info">
                <li>
                  <p>Địa chỉ chúng tôi</p>
                  <p>
                    <strong>
                      <br />
                      <b>[Ho Chi Minh City]</b>
                      <br />
                      Phạm Văn Chiêu, P. 9, Q. Gò Vấp, TP. HCM
                      <br />                    
                    </strong>
                  </p>
                </li>
                <li>
                  <p>Email chúng tôi</p>
                  <p><strong>cskh@tinie.com.vn</strong></p>
                </li>
                <li>
                  <p>Điện thoại</p>
                  <p><strong>0336657490 (Hotline/Zalo)</strong></p>
                </li>
                <li>
                  <p>Thời gian làm việc</p>
                  <p>
                    <strong>08:00 - 20:00 </strong>
                    <br />
                    <strong>Thứ 2 - Chủ Nhật</strong>
                  </p>
                </li>
              </ul>
            </div>
            <div className="box-social-contact">
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="contact-google-map">
        <div class="container-fluid">
            <div class="box-heading-contact">
                <div class="box-map">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15672.51375846868!2d106.6417146!3d10.8778344!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x569afdd3c76bcbbc!2zTU9ITyBGdXJuaXR1cmUgfCBO4buZaSBUaOG6pXQgTU9ITw!5e0!3m2!1svi!2s!4v1612150037621!5m2!1svi!2s" width="100%" height="400" frameborder="0" style={{border:0}} allowfullscreen=""></iframe>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ShowRoom;
