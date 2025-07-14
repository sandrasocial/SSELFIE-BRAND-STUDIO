import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailCaptureData {
  email: string;
  plan: 'free' | 'sselfie-studio';
  source: string;
}

export async function sendWelcomeEmail(data: EmailCaptureData) {
  const isFreePlan = data.plan === 'free';
  
  const subject = isFreePlan 
    ? "Your 5 FREE AI photos are ready (no studio required!)"
    : "Welcome to SSELFIE Studio - Let's build your empire";

  const htmlContent = isFreePlan ? getFreeWelcomeHTML() : getStudioWelcomeHTML();

  try {
    const result = await resend.emails.send({
      from: 'Sandra <sandra@sselfie.ai>',
      to: [data.email],
      subject,
      html: htmlContent,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}

function getFreeWelcomeHTML(): string {
  const loginUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/login`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your FREE AI Photos Are Ready</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
          line-height: 1.6; 
          color: #0a0a0a; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
        }
        .logo { 
          font-family: 'Times New Roman', serif; 
          font-size: 24px; 
          font-weight: 300; 
          letter-spacing: 0.1em; 
          color: #0a0a0a; 
        }
        h1 { 
          font-family: 'Times New Roman', serif; 
          font-size: 28px; 
          font-weight: 300; 
          margin: 30px 0 20px; 
          line-height: 1.3; 
        }
        p { 
          margin: 20px 0; 
          font-size: 16px; 
        }
        .cta-button { 
          display: inline-block; 
          background: #0a0a0a; 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          font-size: 12px; 
          margin: 30px 0; 
        }
        .steps { 
          background: #f5f5f5; 
          padding: 30px; 
          margin: 30px 0; 
        }
        .step { 
          margin: 15px 0; 
          display: flex; 
          align-items: flex-start; 
        }
        .step-number { 
          background: #0a0a0a; 
          color: white; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 12px; 
          margin-right: 15px; 
          flex-shrink: 0; 
        }
        .signature { 
          margin-top: 40px; 
          font-style: italic; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SSELFIE</div>
        </div>
        
        <h1>Hey there,</h1>
        
        <p>You just did something most people won't - you took action.</p>
        
        <p>Your 5 FREE AI photos are waiting. Here's what happens next:</p>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div>Upload your phone selfies (yes, really - just your phone)</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div>Meet Maya, your AI celebrity stylist who'll help you plan the perfect shoot</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div>Get photos that look like you hired a fancy photographer</div>
          </div>
        </div>
        
        <p>Ready? Click here to start:</p>
        
        <a href="${loginUrl}" class="cta-button">Start My FREE Photos</a>
        
        <p>This is how it begins. One selfie at a time.</p>
        
        <div class="signature">
          <p>Sandra<br>
          <em>Your personal brand bestie</em></p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 40px;">
          You're receiving this because you signed up for FREE AI photos at SSELFIE Studio. 
          This is a one-time welcome email - we respect your inbox.
        </p>
      </div>
    </body>
    </html>
  `;
}

function getStudioWelcomeHTML(): string {
  const loginUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/login`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to SSELFIE Studio</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
          line-height: 1.6; 
          color: #0a0a0a; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
        }
        .logo { 
          font-family: 'Times New Roman', serif; 
          font-size: 24px; 
          font-weight: 300; 
          letter-spacing: 0.1em; 
          color: #0a0a0a; 
        }
        h1 { 
          font-family: 'Times New Roman', serif; 
          font-size: 28px; 
          font-weight: 300; 
          margin: 30px 0 20px; 
          line-height: 1.3; 
        }
        p { 
          margin: 20px 0; 
          font-size: 16px; 
        }
        .cta-button { 
          display: inline-block; 
          background: #0a0a0a; 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          font-size: 12px; 
          margin: 30px 0; 
        }
        .features { 
          background: #f5f5f5; 
          padding: 30px; 
          margin: 30px 0; 
        }
        .feature { 
          margin: 15px 0; 
          display: flex; 
          align-items: flex-start; 
        }
        .feature-bullet { 
          color: #0a0a0a; 
          margin-right: 10px; 
          font-weight: bold; 
        }
        .signature { 
          margin-top: 40px; 
          font-style: italic; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SSELFIE STUDIO</div>
        </div>
        
        <h1>Welcome to the empire,</h1>
        
        <p>You just joined 1,000+ women who decided to stop hiding and start building.</p>
        
        <p>Here's what you get with SSELFIE Studio:</p>
        
        <div class="features">
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>100 AI images per month (that's $0.47 per professional photo)</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Maya, your AI celebrity stylist & photographer</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Victoria, your AI brand strategist who builds your website</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Full luxury flatlay collections for content</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Custom domain connection (yourname.com)</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Priority support from my team</div>
          </div>
        </div>
        
        <p>Ready to build your brand empire?</p>
        
        <a href="${loginUrl}" class="cta-button">Access My Studio</a>
        
        <p>This is where it all begins. Your phone + my strategy = your empire.</p>
        
        <div class="signature">
          <p>Sandra<br>
          <em>Your empire-building bestie</em></p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 40px;">
          You're receiving this because you joined SSELFIE Studio. 
          Welcome to the community - let's build something amazing together.
        </p>
      </div>
    </body>
    </html>
  `;
}