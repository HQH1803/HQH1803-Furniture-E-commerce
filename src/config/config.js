// Cấu hình chung cho toàn bộ ứng dụng
const config = {
  // API Base URL
  apiBaseUrl: process.env.NODE_ENV === 'production'
    ? 'https://furniture-e-commerce-wt2i.onrender.com'
    : process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000',
  
  // Các endpoint API
  endpoints: {
    login: '/api/login',
    googleLogin: '/api/google-login',
    facebookLogin: '/api/facebook-login',
    products: '/api/san-pham',
    news: '/api/tin-tuc',
    latestNews: '/api/tin-tuc-moi-nhat',
    favorites: '/api/favorites',
    orders: '/api/don-hang',
    promotions: '/api/promotions',
    accounts: '/api/accounts',
    colors: '/api/mau-sac',
    sizes: '/api/kich-thuoc',
    roomTypes: '/api/loai-phong',
    productTypes: '/api/loai-san-pham',
    roomProductTypes: '/api/loai-phong-san-pham',
    admin: {
      products: '/api/admin/san-pham',
      news: '/api/admin/tin-tuc',
      promotions: '/api/admin/promotions',
      orders: '/api/admin/don-hang',
      accounts: '/api/admin/accounts'
    }
  },
  
  // Các thông tin khác
  uploadUrl: '/api/admin/upload',
  imageBaseUrl: process.env.NODE_ENV === 'production'
    ? 'https://furniture-e-commerce-wt2i.onrender.com/uploads'
    : 'http://localhost:4000/uploads'
};

export default config; 