import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const CalculatorContainer = styled.div`
  max-width: 800px;
  margin: 4rem auto;
  padding: 2rem;
  font-family: "Times New Roman", serif;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 1px;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 2rem;
`;

const Column = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tool = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TotalSavings = styled(motion.div)`
  text-align: center;
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 300;
  }
  
  .amount {
    font-size: 3.5rem;
    color: #ffffff;
  }
`;

const SavingsCalculator: React.FC = () => {
  const [yearlyTotal, setYearlyTotal] = useState(0);
  
  const commonTools = [
    { name: "Canva Pro", cost: 119.88 },
    { name: "ChatGPT Plus", cost: 240 },
    { name: "Adobe Creative Cloud", cost: 599.88 },
    { name: "Later Social Media", cost: 180 },
    { name: "Website Builder", cost: 144 }
  ];

  const sselfiePrice = 67 * 12; // Entrepreneur plan yearly

  useEffect(() => {
    const totalToolsCost = commonTools.reduce((acc, tool) => acc + tool.cost, 0);
    const yearlySavings = totalToolsCost - sselfiePrice;
    setYearlyTotal(yearlySavings);
  }, []);

  return (
    <CalculatorContainer>
      <Title>Your Potential Savings</Title>
      
      <ComparisonGrid>
        <Column
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>Current Tools (Yearly)</h3>
          {commonTools.map((tool) => (
            <Tool key={tool.name}>
              <span>{tool.name}</span>
              <span>€{tool.cost}/year</span>
            </Tool>
          ))}
        </Column>
        
        <Column
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>SSELFIE STUDIO</h3>
          <Tool>
            <span>Entrepreneur Plan</span>
            <span>€{sselfiePrice}/year</span>
          </Tool>
        </Column>
      </ComparisonGrid>

      <TotalSavings
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3>Your Yearly Savings</h3>
        <div className="amount">€{yearlyTotal}</div>
      </TotalSavings>
    </CalculatorContainer>
  );
};

export default SavingsCalculator;