import { FC } from 'react';
import ComponentDemo from '../components/ComponentDemo';

const ComponentDemoPage: FC = () => {
  const handleComponentAction = () => {
    console.log('🚀 ELENA: Component demonstration activated!');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
      padding: '2rem 0'
    }}>
      <ComponentDemo 
        title="ELENA's Working Component Demonstration"
        onAction={handleComponentAction}
      />
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '3rem auto', 
        padding: '0 2rem',
        textAlign: 'center',
        color: '#666666'
      }}>
        <h2 style={{ 
          fontFamily: 'Times New Roman, serif',
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: '#0a0a0a'
        }}>
          Multi-Agent Coordination Capabilities
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            background: '#ffffff',
            borderLeft: '3px solid #0a0a0a',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0a0a0a' }}>Aria</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Luxury UX Designer & Creative Director</p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            background: '#ffffff',
            borderLeft: '3px solid #333333',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0a0a0a' }}>Zara</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Dev AI & Technical Mastermind</p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            background: '#ffffff',
            borderLeft: '3px solid #666666',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0a0a0a' }}>Rachel</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Voice AI & Copywriting Twin</p>
          </div>
        </div>
        
        <p style={{ 
          marginTop: '2rem', 
          fontStyle: 'italic',
          color: '#999999'
        }}>
          ✅ This component demonstrates ELENA's complete autonomous implementation capability
          with luxury design standards and proper React TypeScript structure.
        </p>
      </div>
    </div>
  );
};

export default ComponentDemoPage;