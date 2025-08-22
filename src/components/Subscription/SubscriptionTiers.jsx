import React from 'react';
import styled from 'styled-components';

const TierContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  background: linear-gradient(to right, #fafafa, #f3f3f3);
`;

const TierCard = styled.div`
  background: white;
  padding: 3rem;
  border: 1px solid #000;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
  }

  h2 {
    font-family: "Times New Roman", serif;
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .price {
    font-size: 3rem;
    font-weight: 300;
    margin: 2rem 0;
  }
`;

const SubscriptionTiers = () => {
  return (
    <TierContainer>
      <TierCard>
        <h2>CREATOR</h2>
        <div className="price">€27/month</div>
        <ul>
          <li>Essential AI training tools</li>
          <li>Basic style customization</li>
          <li>Standard photoshoot prompts</li>
          <li>Simple website builder</li>
        </ul>
      </TierCard>

      <TierCard style={{ border: '2px solid #000' }}>
        <h2>ENTREPRENEUR</h2>
        <div className="price">€67/month</div>
        <ul>
          <li>Advanced AI model training</li>
          <li>Premium style customization</li>
          <li>Professional photoshoot direction</li>
          <li>Advanced website builder + analytics</li>
          <li>Brand management tools</li>
        </ul>
      </TierCard>
    </TierContainer>
  );
};

export default SubscriptionTiers;