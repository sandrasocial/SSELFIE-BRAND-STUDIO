import React, { useState } from 'react';

const EarlyBirdSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    selectedPlan: 'creator',
    referralSource: ''
  });

  const [status, setStatus] = useState({
    message: '',
    type: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here we'll add actual form submission logic
    // For now, simulating success
    setStatus({
      message: 'Thanks for joining! Check your email for exclusive early-bird access.',
      type: 'success'
    });
  };

  return (
    <div className="early-bird-signup">
      <div className="early-bird-header">
        <h2>🚀 Early Bird Access</h2>
        <p className="subtitle">Be among the first to transform your personal brand</p>
      </div>

      <div className="offer-details">
        <div className="benefit-card">
          <h3>Early Bird Benefits</h3>
          <ul>
            <li>✨ Lock in lowest-ever pricing</li>
            <li>🎯 Priority access to new features</li>
            <li>🌟 Exclusive founding member badge</li>
            <li>💫 Personal onboarding session</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plan">Select Your Plan</label>
          <select
            id="plan"
            value={formData.selectedPlan}
            onChange={(e) => setFormData({...formData, selectedPlan: e.target.value})}
          >
            <option value="creator">Creator (€27/month)</option>
            <option value="entrepreneur">Entrepreneur (€67/month)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="referral">How did you hear about us?</label>
          <select
            id="referral"
            value={formData.referralSource}
            onChange={(e) => setFormData({...formData, referralSource: e.target.value})}
          >
            <option value="">Select an option</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="referral">Friend/Colleague</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button type="submit" className="submit-button">
          Secure Your Early Bird Spot
        </button>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </form>

      <div className="spots-remaining">
        <p>🔥 Only 50 early-bird spots remaining!</p>
      </div>
    </div>
  );
};

export default EarlyBirdSignup;