import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './Auth.module.css';

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(formData);
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Create Your Account</h2>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? styles.errorInput : ''}
              placeholder="Enter your first name"
              disabled={isLoading}
            />
            {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? styles.errorInput : ''}
              placeholder="Enter your last name"
              disabled={isLoading}
            />
            {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? styles.errorInput : ''}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? styles.errorInput : ''}
            placeholder="Create a password"
            disabled={isLoading}
          />
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? styles.errorInput : ''}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="acceptTerms">
              I accept the <a href="/terms">Terms and Conditions</a>
            </label>
          </div>
          {errors.acceptTerms && <span className={styles.errorText}>{errors.acceptTerms}</span>}
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className={styles.links}>
          <a href="/login">Already have an account? Log in</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;