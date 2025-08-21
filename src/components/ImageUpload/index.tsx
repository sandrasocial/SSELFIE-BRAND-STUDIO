import React, { useState } from 'react';
import { Upload, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  minImages?: number;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  minImages = 10,
  maxImages = 20
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const props = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    onChange(info: any) {
      const { status } = info.file;
      
      if (status === 'uploading') {
        setUploading(true);
        setProgress(Math.round((info.fileList.filter((f: any) => f.status === 'done').length / info.fileList.length) * 100));
      }
      
      if (status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        setProgress(100);
        setUploading(false);
      } else if (status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
      
      setFileList(info.fileList);
    },
    beforeUpload(file: File) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      
      if (fileList.length >= maxImages) {
        message.error(`You can only upload up to ${maxImages} images!`);
        return false;
      }
      
      return true;
    },
    onDrop(e: React.DragEvent) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleSubmit = () => {
    if (fileList.length < minImages) {
      message.error(`Please upload at least ${minImages} images!`);
      return;
    }
    
    const urls = fileList.map(file => file.response?.url).filter(Boolean);
    onUploadComplete(urls);
  };

  return (
    <div className="upload-container">
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag images to this area to upload</p>
        <p className="ant-upload-hint">
          Upload {minImages}-{maxImages} selfies to train your AI model
        </p>
      </Dragger>
      
      {uploading && <Progress percent={progress} />}
      
      <div className="upload-status">
        <p>Uploaded: {fileList.filter((f: any) => f.status === 'done').length} / {maxImages}</p>
        {fileList.length >= minImages && (
          <button 
            onClick={handleSubmit}
            className="submit-button"
          >
            Continue
          </button>
        )}
      </div>
      
      <style jsx>{`
        .upload-container {
          padding: 24px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .upload-status {
          margin-top: 16px;
          text-align: center;
        }
        
        .submit-button {
          background: #1890ff;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .submit-button:hover {
          background: #40a9ff;
        }
      `}</style>
    </div>
  );
};