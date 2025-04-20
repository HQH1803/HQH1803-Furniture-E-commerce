import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MoTaLoaiPhong = ({ id }) => {
    const [motaLoaiPhong, setMotaLoaiPhong] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const descriptionStyle = {
        overflow: 'hidden',
        height: expanded ? 'auto' : '260px'
    };
    const buttonText = expanded ? 'Rút gọn nội dung' : 'Xem thêm nội dung';
    useEffect(() => {
        const fetchMotaLoaiPhong = async () => {
            try {
                const response = await axios.get(`http://furniture-e-commerce-wt2i.onrender.com/api/loai-phong/${id}`);
                console.log(response.data)
                if (response.data && response.data.mo_ta_phong) {
                    setMotaLoaiPhong(response.data.mo_ta_phong);
                } else {
                    setError('Mô tả loại phòng không tìm thấy.');
                }
            } catch (error) {
                console.error('Error fetching description: ', error);
                setError('Không thể tải mô tả.');
            } finally {
                setLoading(false);
            }
        };

        fetchMotaLoaiPhong();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <div  style={descriptionStyle}>
                <div dangerouslySetInnerHTML={{ __html: motaLoaiPhong }} />
            </div>
            <div className="description-btn">
            <button className="expandable-content_toggle js_expandable_content btn-viewmore" onClick={toggleExpand}>
                <span className="expandable-content_toggle-icon"></span>
                <span className="expandable-content_toggle-text">{buttonText}</span>
            </button>
        </div>
        </div>
        

    );
        
};

export default MoTaLoaiPhong;
