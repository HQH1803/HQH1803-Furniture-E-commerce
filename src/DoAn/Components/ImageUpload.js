import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function ImageUpload({ setImageUrl }) {
    const [image, setImage] = useState(null);
    const [fileList, setFileList] = useState([]);

    const handleImage = (e) => {
        const file = e.target.files[0];
        console.log(file);
        setImage(file);
        setFileList([{ uid: '-1', name: file.name, status: 'done', thumbUrl: URL.createObjectURL(file) }]);
    };

    const handleApi = async () => {
        if (!image) {
            message.error('Please select an image before uploading.');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post('http://localhost:4000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            message.success('Image uploaded successfully!');
            // Assuming the API response contains the URL of the uploaded image
            const imageUrl = response.data.imageUrl;
            setImageUrl(imageUrl);  // Update the parent component's state with the image URL
        } catch (error) {
            console.error('Error uploading image', error);
            message.error('Failed to upload image.');
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImage} />
            <Upload
                listType="picture-card"
                fileList={fileList}
                onRemove={() => {
                    setImage(null);
                    setFileList([]);
                }}
                beforeUpload={() => false}
                showUploadList={{ showRemoveIcon: true }}
            >
                {fileList.length >= 1 ? null : <Button icon={<UploadOutlined />}>Select Image</Button>}
            </Upload>
            <Button type="primary" onClick={handleApi} style={{ marginTop: '10px' }}>
                Upload Image
            </Button>
        </div>
    );
}

export default ImageUpload;
