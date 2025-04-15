import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import '../css/MyCarousel.css';

function MyCarousel() {
  return (
    <Carousel indicators={false}>
      <Carousel.Item interval={2000}>
        <img
          className="d-block w-100"
          src={require("../images/carousel1.webp")}
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item interval={2000}>
        <img
          className="d-block w-100"
          src={require("../images/carousel2.webp")}
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={require("../images/carousel3.webp")}
          alt="Third slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={require("../images/carousel4.webp")}
          alt="Fourth slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default MyCarousel;
