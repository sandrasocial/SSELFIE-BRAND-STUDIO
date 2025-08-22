import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

// Styled components for enhanced visuals
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.action.hover,
  },
}));

const ImagePreview = styled('img')({
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '8px',
  margin: '4px',
});

const TrainingPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState('idle'); // idle, uploading, training, completed, error
  const [errorMessage, setErrorMessage] = useState('');

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    // Validate files
    const validFiles = acceptedFiles.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        setErrorMessage('Please upload only image files.');
      }
      return isValid;
    });

    setFiles(validFiles);
    setErrorMessage('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 20,
    maxSize: 5242880, // 5MB
  });

  // Simulate training progress
  useEffect(() => {
    if (trainingStatus === 'training') {
      const interval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTrainingStatus('completed');
            return 100;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [trainingStatus]);

  // Handle upload
  const handleUpload = async () => {
    if (files.length < 10) {
      setErrorMessage('Please upload at least 10 photos for optimal training.');
      return;
    }

    setUploading(true);
    setTrainingStatus('uploading');
    
    try {
      // Simulated upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(i);
      }

      // Start training
      setTrainingStatus('training');
      setTrainingProgress(0);
      
    } catch (error) {
      setErrorMessage('Upload failed. Please try again.');
      setTrainingStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const renderStatus = () => {
    switch (trainingStatus) {
      case 'uploading':
        return (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Uploading photos... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        );
      case 'training':
        return (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Training your personal AI model... {trainingProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={trainingProgress} />
          </Box>
        );
      case 'completed':
        return (
          <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 2 }}>
            Training completed successfully!
          </Alert>
        );
      case 'error':
        return (
          <Alert icon={<ErrorIcon />} severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Train Your Personal AI Model
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          Upload 10-20 high-quality selfies for best results. Ensure photos have:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip icon={<InfoIcon />} label="Good lighting" color="primary" variant="outlined" />
          <Chip icon={<InfoIcon />} label="Clear face visibility" color="primary" variant="outlined" />
          <Chip icon={<InfoIcon />} label="Various expressions" color="primary" variant="outlined" />
        </Stack>
      </Alert>

      <UploadBox {...getRootProps()}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        {isDragActive ? (
          <Typography variant="h6">Drop your photos here...</Typography>
        ) : (
          <Typography variant="h6">
            Drag & drop photos here, or click to select
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Supported formats: JPG, PNG (max 5MB each)
        </Typography>
      </UploadBox>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Photos ({files.length})
          </Typography>
          <Grid container spacing={1}>
            {files.map((file, index) => (
              <Grid item key={index}>
                <ImagePreview src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {renderStatus()}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || trainingStatus === 'training' || trainingStatus === 'completed'}
          startIcon={uploading ? <CircularProgress size={20} /> : null}
        >
          {uploading ? 'Uploading...' : 'Start Training'}
        </Button>
      </Box>
    </Container>
  );
};

export default TrainingPage;