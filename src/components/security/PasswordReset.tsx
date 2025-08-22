import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/toast';

interface PasswordResetProps {
  onSubmit: (email: string) => Promise<void>;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(email);
      toast({
        title: "Reset Link Sent",
        description: "Please check your email for password reset instructions.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Unable to Reset",
        description: "Please verify your email and try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8"
    >
      <h2 className="text-3xl font-serif mb-6 text-gray-800">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Reset Password"}
        </button>
      </form>
    </motion.div>
  );
};