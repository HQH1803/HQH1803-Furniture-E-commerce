const axios = require('axios');

// Thay {post-id} bằng ID của bài viết bạn muốn lấy bình luận
const postId = 'YOUR_POST_ID'; 
const accessToken = 'EAAiPEh7PZBAcBO1wpOZClEuXyjbTUwQ7xMAuFspT2201xuvtvCIDaomPtAZCN54g96YTDsRaMdJwqjO1zImzUKjH2HEDyx3vcIdtINwbrY7DW0qCxnCZBSJZCbB2STrEBTZC2msbIViVgxY2WA2xo7BPZBuhawZC7PZCVdZBVVdbbdLkyfCRauuhZCRZAH6gR6pZB90F0wK4d4Ou5eqtQKiJDjI8AB1Tob1jFAohZA6dWvXf3q7pnxZACy0xvgrGZCUcPBdSKRQZD'; // Thay bằng Access Token của bạn

const fetchComments = async () => {
    try {
        const response = await axios.get(`https://graph.facebook.com/${postId}/comments`, {
            params: {
                access_token: accessToken,
                fields: 'id,from,message,created_time', // Các trường thông tin bạn muốn lấy
            },
        });
        console.log('Bình luận:', response.data.data);
    } catch (error) {
        console.error('Lỗi khi lấy bình luận:', error);
    }
};

fetchComments();
