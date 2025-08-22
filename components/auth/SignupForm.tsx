import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, TextField, Alert, CircularProgress, Select, MenuItem } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  subscription: z.enum(['creator', 'entrepreneur']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await signup(data.email, data.password, data.subscription);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert severity="error">{error}</Alert>}
      
      <TextField
        fullWidth
        label="Email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        fullWidth
        type="password"
        label="Password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <TextField
        fullWidth
        type="password"
        label="Confirm Password"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Select
        fullWidth
        label="Subscription"
        {...register('subscription')}
        error={!!errors.subscription}
      >
        <MenuItem value="creator">Creator (€27/month)</MenuItem>
        <MenuItem value="entrepreneur">Entrepreneur (€67/month)</MenuItem>
      </Select>

      <Button
        fullWidth
        variant="contained"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>
    </form>
  );
};