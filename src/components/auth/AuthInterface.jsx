import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.xl};
  max-width: 400px;
  margin: 0 auto;
`;

const AuthForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${props => props.error ? theme.colors.error : '#E0E0E0'};
  border-radius: 4px;
  font-family: ${theme.typography.fontFamily};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    background: ${theme.colors.accent};
  }
`;

const AuthInterface = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Authentication logic will be implemented here
  };

  return (
    <AuthContainer>
      <h1>{isLogin ? 'Welcome Back!' : 'Join SSELFIE Studio'}</h1>
      <AuthForm onSubmit={handleSubmit}>
        <Input 
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <Input 
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        {!isLogin && (
          <Input 
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        )}
        <Button type="submit">
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>
      </AuthForm>
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <a href="#" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign Up' : 'Log In'}
        </a>
      </p>
    </AuthContainer>
  );
};

export default AuthInterface;