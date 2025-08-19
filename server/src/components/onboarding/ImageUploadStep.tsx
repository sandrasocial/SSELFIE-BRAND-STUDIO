import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress, Button, Text, VStack, HStack, Box, Image } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadStepProps {
  onComplete: (images: string[]) => void;
  minImages: number;
  maxImages: number;
}

export const ImageUploadStep: React.FC<ImageUploadStepProps> = ({
  onComplete,
  minImages = 10,
  maxImages = 20
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      try {
        // Simulate upload progress
        setProgress((i + 1) / acceptedFiles.length * 100);
        
        // Convert to base64 for preview
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(base64);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setUploading(false);
    
    if (uploadedImages.length >= minImages) {
      onComplete(uploadedImages);
    }
  }, [uploadedImages, minImages, onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': ['.jpeg', '.jpg', '.png']},
    multiple: true
  });

  const progressColor = uploadedImages.length >= minImages ? 'green.500' : 'blue.500';
  const progressPercent = (uploadedImages.length / minImages) * 100;

  return (
    <VStack spacing={6} w="full" p={6}>
      <Text fontSize="2xl" fontWeight="bold">
        Upload Your Selfies
      </Text>
      
      <Text textAlign="center" color="gray.600">
        Upload {minImages}-{maxImages} selfies to train your personal AI model.
        Currently: {uploadedImages.length} / {minImages} minimum
      </Text>

      <Box
        {...getRootProps()}
        w="full"
        h="200px"
        border="3px dashed"
        borderColor={isDragActive ? 'blue.400' : 'gray.200'}
        borderRadius="xl"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={isDragActive ? 'blue.50' : 'transparent'}
        transition="all 0.2s"
        _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
      >
        <input {...getInputProps()} />
        <VStack spacing={2}>
          <Text fontSize="lg" color={isDragActive ? 'blue.500' : 'gray.600'}>
            {isDragActive ? 'Drop your images here!' : 'Drag & drop images here or click to select'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Supported formats: JPG, PNG
          </Text>
        </VStack>
      </Box>

      {uploading && (
        <Progress
          w="full"
          value={progress}
          size="sm"
          colorScheme="blue"
          isAnimated
          hasStripe
        />
      )}

      <Progress
        w="full"
        value={progressPercent}
        size="lg"
        colorScheme={progressColor}
        borderRadius="full"
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <HStack wrap="wrap" spacing={2} justify="center">
            {uploadedImages.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Image
                  src={img}
                  alt={`Uploaded ${idx + 1}`}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                  border="2px solid"
                  borderColor="gray.200"
                />
              </motion.div>
            ))}
          </HStack>
        </motion.div>
      </AnimatePresence>

      <Button
        colorScheme={uploadedImages.length >= minImages ? 'green' : 'gray'}
        isDisabled={uploadedImages.length < minImages}
        onClick={() => onComplete(uploadedImages)}
        size="lg"
        w="full"
      >
        {uploadedImages.length >= minImages
          ? 'Continue to Next Step'
          : `Upload at least ${minImages - uploadedImages.length} more images`}
      </Button>
    </VStack>
  );
};