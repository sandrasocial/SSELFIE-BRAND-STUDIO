import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthTransition } from '@/components/auth/AuthTransition';
import { Button, Paper, Typography, Box } from '@mui/material';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 480
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>

        <AuthTransition isVisible={isLogin}>
          <LoginForm />
        </AuthTransition>

        <AuthTransition isVisible={!isLogin}>
          <SignupForm />
        </AuthTransition>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            onClick={() => setIsLogin(!isLogin)}
            sx={{ mt: 2 }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}