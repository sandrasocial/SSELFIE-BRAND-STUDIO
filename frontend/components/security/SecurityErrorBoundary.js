import React from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button } from '@chakra-ui/react';
import { securityService } from '../../services/SecurityService';

class SecurityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log security-related errors
    console.error('Security Error:', error, errorInfo);
    
    // Handle specific security errors
    if (error.name === 'AuthenticationError') {
      securityService.clearTokens();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  handleLogout = () => {
    securityService.clearTokens();
    window.location.href = '/login';
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4}>
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Security Error
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {this.state.error?.message || 'An unexpected security error occurred.'}
            </AlertDescription>
            <Box mt={4}>
              <Button colorScheme="red" mr={3} onClick={this.handleLogout}>
                Logout
              </Button>
              <Button colorScheme="gray" onClick={this.handleRetry}>
                Retry
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}