import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FirebaseStorageService from '../FirebaseStorageService';

interface Props {
  basePath: string,
  existingImageUrl: string,
  handleUploadFinish: (downloadUrl: string) => void,
  handleUploadCancel: () => void,
}

const ImageUploadPreview = (props: Props) => {
  const { basePath, existingImageUrl, handleUploadFinish, handleUploadCancel } = props;

  const [uploadProgress, setUploadProgress] = useState(-1);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(existingImageUrl) {
      setImageUrl(existingImageUrl);
    } else {
      setUploadProgress(-1);
      setImageUrl('');
      if(fileInputRef.current !== null) {
        fileInputRef.current.value = '';
      }
    }
  },[existingImageUrl]);

  const handleFileChanged = async (event: any) => {
    const files = event.target.files;
    const file = files[0];

    if(!file) {
      alert('File Select Failed. Please try again');
      return;
    }

    const generatedFileId = uuidv4();

    try {
      const downloadUrl = await FirebaseStorageService.uploadFile(file, `${basePath}/${generatedFileId}`, setUploadProgress);

      setImageUrl(downloadUrl);
      handleUploadFinish(downloadUrl);

    } catch (error) {
      setUploadProgress(-1);
      if(fileInputRef.current !== null) {
        fileInputRef.current.value = '';
      }
      if(error instanceof Error){
        alert(error.message);
        throw error;
      }
      
    }
  }

  const handleCancelImageClick = () => {
    FirebaseStorageService.deleteFile(imageUrl);
    if(fileInputRef.current !== null) {
      fileInputRef.current.value = '';
    }
    setImageUrl('');
    setUploadProgress(-1);
    handleUploadCancel();
  }

  return (
    <div className='image-upload-preview-container'>
      <input 
        type="file" 
        accept='image/*'
        onChange={handleFileChanged}
        ref={fileInputRef}
        hidden={uploadProgress > -1 || !!imageUrl}
      />
      {
        !imageUrl && uploadProgress > -1 ? (
          <div>
            <label htmlFor="file">Upload Progress:</label>
            <progress id='file' value={uploadProgress} max={100}>
              {uploadProgress}%
            </progress>
            <span>{uploadProgress}%</span>
          </div>
        ) : null
      }
      {
        imageUrl ? (
          <div className='image-preview'>
            <img src={imageUrl} alt={imageUrl} className='image' />
            <button
              type='button'
              onClick={handleCancelImageClick}
              className='primary-button'
            >Cancel Image</button>
          </div>
        ) : null
      }
    </div>
  );
};

export default ImageUploadPreview;