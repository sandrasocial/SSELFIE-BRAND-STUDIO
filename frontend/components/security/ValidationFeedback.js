import React from 'react';
import { Alert, AlertIcon, Box } from '@chakra-ui/react';

export const ValidationFeedback = ({ 
  isValid, 
  message, 
  severity = 'error'
}) => {
  if (!message) return null;
  
  return (
    <Box mt={2}>
      <Alert status={severity} borderRadius="md" size="sm">
        <AlertIcon />
        {message}
      </Alert>
    </Box>
  );
};

export const PasswordStrengthIndicator = ({ strength }) => {
  const getStrengthColor = () => {
    switch (strength) {
      case 'strong': return 'green';
      case 'medium': return 'yellow';
      case 'weak': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box mt={1}>
      <Box
        h="4px"
        bg={getStrengthColor()}
        borderRadius="full"
        transition="all 0.2s"
        width={`${(strength === 'strong' ? 100 : strength === 'medium' ? 60 : 30)}%`}
      />
    </Box>
  );
};