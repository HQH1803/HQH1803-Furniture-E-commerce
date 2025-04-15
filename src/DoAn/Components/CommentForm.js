import React, { useEffect } from 'react';
import FacebookSDK from '../Components/FacebookSDK';

const CommentForm = ({ id, type }) => {
  // Dynamically create the URL based on the type and id
  const urlMap = {
    product: `${process.env.REACT_APP_API_BASE_URL}/chitietsanpham/${id}`,
    news: `${process.env.REACT_APP_API_BASE_URL}/chi-tiet-tin-tuc/${id}`
  };

  const Url = urlMap[type]; // Select the correct URL based on the type

  useEffect(() => {
    // Re-initialize Facebook comments plugin after Facebook SDK is loaded
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [id]); // Re-run when productUrl changes

  return (
    <div>
      <FacebookSDK />
      {/* Facebook Comments Section */}
      <div className="fb-comments"
        data-href={Url}
        data-width="100%"
        data-numposts="5">
      </div>
    </div>
  );
};

export default CommentForm;
