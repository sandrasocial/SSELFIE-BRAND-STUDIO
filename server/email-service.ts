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

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  plan: 'free' | 'sselfie-studio';
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

export async function sendPostAuthWelcomeEmail(data: WelcomeEmailData) {
  const isFreePlan = data.plan === 'free';
  const firstName = data.firstName || '';
  
  const subject = isFreePlan 
    ? `${firstName ? firstName + ', ' : ''}Your 5 FREE AI photos are ready!`
    : `${firstName ? firstName + ', ' : ''}Welcome to SSELFIE Studio - Let's build your empire`;

  const htmlContent = isFreePlan ? getPostAuthFreeHTML(firstName) : getPostAuthStudioHTML(firstName);

  try {
    const result = await resend.emails.send({
      from: 'Sandra <sandra@sselfie.ai>',
      to: [data.email],
      subject,
      html: htmlContent,
    });

    console.log('Post-authentication welcome email sent successfully:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Post-authentication email send failed:', error);
    return { success: false, error: error.message };
  }
}

function getPostAuthFreeHTML(firstName: string): string {
  const workspaceUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/workspace`;
  
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
          background: #ffffff;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 20px;
        }
        .logo { 
          font-family: 'Times New Roman', serif; 
          font-size: 32px; 
          font-weight: 300; 
          letter-spacing: 0.2em; 
          color: #0a0a0a; 
          margin-bottom: 10px;
        }
        h1 { 
          font-family: 'Times New Roman', serif; 
          font-size: 28px; 
          font-weight: 300;
          margin: 20px 0;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        .cta-button {
          display: inline-block;
          background: #0a0a0a;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 20px 0;
        }
        .feature-list {
          background: #f8f8f8;
          padding: 20px;
          margin: 20px 0;
        }
        .feature-item {
          margin: 10px 0;
          color: #333;
        }
        .signature {
          margin-top: 30px;
          font-style: italic;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SSELFIE</div>
          <div style="font-size: 12px; letter-spacing: 0.2em; color: #666;">STUDIO</div>
        </div>
        
        <h1>${firstName ? `Hi ${firstName}!` : 'Welcome!'}</h1>
        
        <div class="greeting">
          Your account is live and your 5 FREE AI photos are waiting for you!
        </div>
        
        <p>I'm genuinely excited you're here. This isn't just another photo app – this is where you discover what you look like when you show up as the version of yourself who already made it.</p>
        
        <div style="text-align: center;">
          <a href="${workspaceUrl}" class="cta-button">Access Your Workspace</a>
        </div>
        
        <div class="feature-list">
          <h3 style="margin-top: 0; font-family: 'Times New Roman', serif;">What you get with FREE:</h3>
          <div class="feature-item">• 5 AI photos per month</div>
          <div class="feature-item">• Maya AI photographer chat</div>
          <div class="feature-item">• Victoria AI brand strategist chat</div>
          <div class="feature-item">• Basic luxury flatlay collections</div>
        </div>
        
        <p>Ready to get started? Head to your workspace and upload your first selfies. Maya (your AI photographer) will walk you through everything.</p>
        
        <div class="signature">
          <p>Creating magic,<br>Sandra</p>
          <p style="font-size: 12px; color: #999;">Founder, SSELFIE Studio</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPostAuthStudioHTML(firstName: string): string {
  const workspaceUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/workspace`;
  
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
          background: #ffffff;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 20px;
        }
        .logo { 
          font-family: 'Times New Roman', serif; 
          font-size: 32px; 
          font-weight: 300; 
          letter-spacing: 0.2em; 
          color: #0a0a0a; 
          margin-bottom: 10px;
        }
        h1 { 
          font-family: 'Times New Roman', serif; 
          font-size: 28px; 
          font-weight: 300;
          margin: 20px 0;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        .cta-button {
          display: inline-block;
          background: #0a0a0a;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 20px 0;
        }
        .feature-list {
          background: #f8f8f8;
          padding: 20px;
          margin: 20px 0;
        }
        .feature-item {
          margin: 10px 0;
          color: #333;
        }
        .signature {
          margin-top: 30px;
          font-style: italic;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SSELFIE</div>
          <div style="font-size: 12px; letter-spacing: 0.2em; color: #666;">STUDIO</div>
        </div>
        
        <h1>${firstName ? `Welcome to the empire, ${firstName}!` : 'Welcome to the empire!'}</h1>
        
        <div class="greeting">
          Your SSELFIE Studio account is live. Time to build something incredible.
        </div>
        
        <p>You just joined the women who decided to stop waiting for permission. This is where your phone selfies become a complete personal brand business.</p>
        
        <div style="text-align: center;">
          <a href="${workspaceUrl}" class="cta-button">Enter Your Studio</a>
        </div>
        
        <div class="feature-list">
          <h3 style="margin-top: 0; font-family: 'Times New Roman', serif;">Your SSELFIE Studio includes:</h3>
          <div class="feature-item">• 100 AI photos monthly</div>
          <div class="feature-item">• Complete Maya & Victoria AI access</div>
          <div class="feature-item">• All premium flatlay collections</div>
          <div class="feature-item">• Landing page builder & custom domains</div>
          <div class="feature-item">• Priority support</div>
        </div>
        
        <p>Start with uploading your selfies - Maya will create your first professional photoshoot. Then Victoria will help you build the landing page that turns your vision into revenue.</p>
        
        <p><strong>This is where your comeback story begins.</strong></p>
        
        <div class="signature">
          <p>Building empires together,<br>Sandra</p>
          <p style="font-size: 12px; color: #999;">Founder, SSELFIE Studio</p>
        </div>
      </div>
    </body>
    </html>
  `;
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