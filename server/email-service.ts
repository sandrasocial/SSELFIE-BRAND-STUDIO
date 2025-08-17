import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Type definitions for legacy compatibility
export interface EmailCaptureData {
  email: string;
  firstName?: string;
  source?: string;
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  plan?: string;
}

// Legacy function exports for compatibility
export async function sendWelcomeEmail(email: string, firstName?: string, plan?: string) {
  return EmailService.sendModelReadyEmail(email, firstName);
}

export async function sendPostAuthWelcomeEmail(data: WelcomeEmailData) {
  return EmailService.sendModelReadyEmail(data.email, data.firstName);
}

export class EmailService {
  
  // Send model training completion notification
  static async sendModelReadyEmail(userEmail: string, userName?: string) {
    try {
      const firstName = userName?.split(' ')[0] || 'gorgeous';
      
      const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Model is Ready!</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #0a0a0a; 
      margin: 0; 
      padding: 0; 
      background-color: #ffffff;
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
      font-size: 32px;
      font-weight: normal;
      letter-spacing: 0.2em;
      color: #0a0a0a;
      margin-bottom: 20px;
    }
    .content {
      background: #ffffff;
      padding: 40px;
      border: 1px solid #f0f0f0;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #0a0a0a;
    }
    .main-text {
      font-size: 16px;
      margin-bottom: 20px;
      color: #333333;
    }
    .cta-button {
      display: inline-block;
      background-color: #0a0a0a;
      color: #ffffff;
      padding: 16px 32px;
      text-decoration: none;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 30px 0;
      border: none;
    }
    .cta-button:hover {
      background-color: #333333;
    }
    .footer {
      margin-top: 40px;
      font-size: 14px;
      color: #666666;
      text-align: center;
    }
    .signature {
      margin-top: 30px;
      font-style: italic;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SSELFIE STUDIO</div>
      <p style="color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Your AI Model is Ready</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hey ${firstName}! 🎉</div>
      
      <div class="main-text">
        Your AI model just finished training and honestly? I'm SO excited for you to see it!
      </div>
      
      <div class="main-text">
        You know that feeling when you get your photos back from a really good photographer and you're like "Wait, is that actually me?" That's exactly what's about to happen, except these photos are going to be even better because they're completely customized to YOU.
      </div>
      
      <div class="main-text">
        Your personal AI model learned everything about your features, your style, your vibe - and now it's ready to create photos that look like they came from a professional shoot, but way more personal and authentic to who you are.
      </div>
      
      <a href="https://sselfie.ai/workspace" class="cta-button">Create Your First Photos</a>
      
      <div class="main-text">
        Pro tip: Start with the "Professional Headshots" collection - those always turn out incredible and are perfect for updating your LinkedIn, website, or social media. Then have fun with the other styles!
      </div>
      
      <div class="main-text">
        Can't wait to see what you create. Seriously, I'm living for this moment when you see your first AI photos 💕
      </div>
      
      <div class="signature">
        xx Sandra<br>
        <small style="color: #999;">Your Personal Branding Bestie</small>
      </div>
    </div>
    
    <div class="footer">
      <p>SSELFIE Studio - Where Your Personal Brand Gets Born</p>
      <p style="font-size: 12px; color: #999;">If you have any questions, just reply to this email. I read every single one!</p>
    </div>
  </div>
</body>
</html>`;

      const result = await resend.emails.send({
        from: 'Sandra from SSELFIE Studio <sandra@sselfie.ai>',
        to: userEmail,
        subject: `${firstName}, your AI model is ready! Time to create some magic`,
        html: emailContent,
        text: `Hey ${firstName}! 

Your AI model just finished training and I'm SO excited for you to see it!

You know that feeling when you get your photos back from a really good photographer and you're like "Wait, is that actually me?" That's exactly what's about to happen.

Your personal AI model learned everything about your features, your style, your vibe - and now it's ready to create photos that look like they came from a professional shoot.

Ready to create your first photos? Go to: https://sselfie.ai/workspace

Pro tip: Start with the "Professional Headshots" collection - those always turn out incredible and are perfect for updating your LinkedIn, website, or social media.

Can't wait to see what you create!

xx Sandra
Your Personal Branding Bestie

SSELFIE Studio - Where Your Personal Brand Gets Born`
      });

      console.log('✅ Model ready email sent successfully:', result.data?.id);
      return { success: true, emailId: result.data?.id };
      
    } catch (error) {
      console.error('❌ Failed to send model ready email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send training started confirmation email
  static async sendTrainingStartedEmail(userEmail: string, userName?: string) {
    try {
      const firstName = userName?.split(' ')[0] || 'gorgeous';
      
      const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Model is Training!</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #0a0a0a; 
      margin: 0; 
      padding: 0; 
      background-color: #ffffff;
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
      font-size: 32px;
      font-weight: normal;
      letter-spacing: 0.2em;
      color: #0a0a0a;
      margin-bottom: 20px;
    }
    .content {
      background: #ffffff;
      padding: 40px;
      border: 1px solid #f0f0f0;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #0a0a0a;
    }
    .main-text {
      font-size: 16px;
      margin-bottom: 20px;
      color: #333333;
    }
    .footer {
      margin-top: 40px;
      font-size: 14px;
      color: #666666;
      text-align: center;
    }
    .signature {
      margin-top: 30px;
      font-style: italic;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SSELFIE STUDIO</div>
      <p style="color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Training In Progress</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hey ${firstName}!</div>
      
      <div class="main-text">
        Your AI model just started training and I'm honestly so excited for you! 
      </div>
      
      <div class="main-text">
        The AI is studying your selfies right now, learning all the little details that make you uniquely beautiful. It's like having a personal photographer who's getting to know exactly how to capture your best angles and expressions.
      </div>
      
      <div class="main-text">
        This usually takes about 15-20 minutes (sometimes up to 30 if our servers are busy), and I'll send you another email the moment it's ready.
      </div>
      
      <div class="main-text">
        You can totally close this page and go live your life - no need to sit here watching it train! When it's done, you'll get an email from me and then the real fun begins.
      </div>
      
      <div class="signature">
        xx Sandra<br>
        <small style="color: #999;">Your Personal Branding Bestie</small>
      </div>
    </div>
    
    <div class="footer">
      <p>SSELFIE Studio - Where Your Personal Brand Gets Born</p>
    </div>
  </div>
</body>
</html>`;

      const result = await resend.emails.send({
        from: 'Sandra from SSELFIE Studio <sandra@sselfie.ai>',
        to: userEmail,
        subject: `${firstName}, your AI model is training! Get ready for magic`,
        html: emailContent,
        text: `Hey ${firstName}!

Your AI model just started training and I'm honestly so excited for you!

The AI is studying your selfies right now, learning all the little details that make you uniquely beautiful. It's like having a personal photographer who's getting to know exactly how to capture your best angles.

This usually takes about 15-20 minutes, and I'll send you another email the moment it's ready.

You can totally close this page and go live your life - no need to sit here watching it train!

xx Sandra
Your Personal Branding Bestie

SSELFIE Studio - Where Your Personal Brand Gets Born`
      });

      console.log('✅ Training started email sent successfully:', result.data?.id);
      return { success: true, emailId: result.data?.id };
      
    } catch (error) {
      console.error('❌ Failed to send training started email:', error);
      return { success: false, error: error.message };
    }
  }
}