import React, {useEffect} from 'react';

const FacebookSDK = () => {
  useEffect(() => {
    // Get the Facebook App ID from environment variables
    const fbAppId = process.env.REACT_APP_API_APPID_FACEBOOK;
    if (window.FB) {
      window.FB.XFBML.parse();
    }
    if (!window.FB) {
      const fbScript = document.createElement('script');
      fbScript.async = true;
      fbScript.defer = true;
      fbScript.crossOrigin = 'anonymous';
      fbScript.src = `https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v21.0&appId=${fbAppId}&autoLogAppEvents=1`;

      // Append the script to the body
      document.body.appendChild(fbScript);

      fbScript.onload = () => {
        // Initialize the Facebook SDK after the script loads
        window.FB.init({
          appId: fbAppId,
          xfbml: true,
          version: 'v21.0',
        });
      };

      return () => {
        // Clean up script when the component unmounts
        document.body.removeChild(fbScript);
      };
    }
  }, []);

  return (
    <div></div>
  ); // This component does not render anything
};

export default FacebookSDK;
