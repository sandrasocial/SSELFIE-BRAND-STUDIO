import React, { useState } from 'react';
import { Box, Button, Progress, Text, VStack, Image, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface UploadInterfaceProps {
  onUploadComplete: (file: File) => void;
  maxFileSize: number; // Based on subscription tier
  allowedFileTypes: string[];
}

export const UploadInterface: React.FC<UploadInterfaceProps> = ({
  onUploadComplete,
  maxFileSize,
  allowedFileTypes,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a supported image format.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File too large. Maximum size is ${maxFileSize / 1000000}MB`);
      return;
    }

    setSelectedFile(file);
    simulateUpload();
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onUploadComplete(selectedFile!);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4} w="100%">
        <Box
          w="100%"
          h="300px"
          border="2px dashed"
          borderColor={error ? "red.300" : "gray.300"}
          borderRadius="lg"
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          bg={selectedFile ? "gray.50" : "transparent"}
          transition="all 0.3s"
          _hover={{ borderColor: "brand.500" }}
        >
          {selectedFile ? (
            <Image
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              maxH="250px"
              objectFit="contain"
            />
          ) : (
            <>
              <Text fontSize="lg" mb={2}>Drag and drop your image here</Text>
              <Text fontSize="sm" color="gray.500">or</Text>
              <input
                type="file"
                accept={allowedFileTypes.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  as="span"
                  colorScheme="brand"
                  size="lg"
                  mt={2}
                  cursor="pointer"
                >
                  Choose File
                </Button>
              </label>
            </>
          )}
        </Box>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <Box w="100%">
            <Progress
              value={uploadProgress}
              size="sm"
              colorScheme="brand"
              borderRadius="full"
            />
            <Text mt={2} fontSize="sm" textAlign="center">
              Uploading... {uploadProgress}%
            </Text>
          </Box>
        )}

        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}
      </VStack>
    </motion.div>
  );
};