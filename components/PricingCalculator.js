import React, { useState } from 'react';

const PricingCalculator = () => {
  const [selectedPlan, setSelectedPlan] = useState('creator');
  const [currentToolsCost, setCurrentToolsCost] = useState(0);
  
  const plans = {
    creator: {
      price: 27,
      features: [
        'AI Personal Brand Training',
        'Style Guide Generation',
        'Photoshoot Prompts',
        'Basic Website Builder',
        'Social Media Management'
      ]
    },
    entrepreneur: {
      price: 67,
      features: [
        'Everything in Creator Plan',
        'Advanced AI Training',
        'Multiple Brand Personas',
        'Advanced Analytics',
        'Priority Support'
      ]
    }
  };

  const calculateSavings = () => {
    const monthlySSELFIECost = plans[selectedPlan].price;
    return currentToolsCost - monthlySSELFIECost;
  };

  return (
    <div className="pricing-calculator">
      <h2>Calculate Your Savings</h2>
      <div className="calculator-inputs">
        <div className="plan-selector">
          <h3>Choose Your Plan</h3>
          <select 
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            <option value="creator">Creator (€27/month)</option>
            <option value="entrepreneur">Entrepreneur (€67/month)</option>
          </select>
        </div>
        
        <div className="current-costs">
          <h3>Your Current Monthly Tools Cost</h3>
          <input
            type="number"
            value={currentToolsCost}
            onChange={(e) => setCurrentToolsCost(Number(e.target.value))}
            placeholder="Enter current monthly spend"
          />
        </div>
      </div>

      <div className="savings-display">
        <h3>Your Monthly Savings</h3>
        <div className="savings-amount">€{calculateSavings()}</div>
      </div>

      <div className="selected-features">
        <h3>Included in Your Plan:</h3>
        <ul>
          {plans[selectedPlan].features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
      
      <div className="early-bird-cta">
        <h3>🔥 Early Bird Special</h3>
        <p>Lock in these prices now - limited time offer!</p>
        <button className="signup-button">Secure Your Spot</button>
      </div>
    </div>
  );
};

export default PricingCalculator;