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
    ? "Okay, let's do this thing. Your 5 FREE photos are waiting..."
    : "Holy sh*t, you actually did it! Welcome to SSELFIE Studio!";

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
    ? `${firstName ? firstName + ', ' : ''}okay let's get you those photos...`
    : `${firstName ? firstName + ', ' : ''}you're IN! Time to build your empire 🎉`;

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
      <title>Let's get you those photos!</title>
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
        
        <h1>${firstName ? `Hey ${firstName}!` : 'Hey beautiful!'}</h1>
        
        <div class="greeting">
          Okay, so you actually did it. You signed up. Good for you!
        </div>
        
        <p>Look, I'm not gonna lie - most people just scroll past and keep dreaming. But you? You're here. That already tells me something about you.</p>
        
        <p>Your 5 FREE photos are waiting, but real talk? This isn't just about photos. This is about you finally seeing yourself the way the world sees you when you're not hiding.</p>
        
        <div style="text-align: center;">
          <a href="${workspaceUrl}" class="cta-button">Let's Do This</a>
        </div>
        
        <div class="feature-list">
          <h3 style="margin-top: 0; font-family: 'Times New Roman', serif;">Here's what you get (completely free):</h3>
          <div class="feature-item">• 5 AI photos per month (no BS, actually free)</div>
          <div class="feature-item">• Maya - your AI photographer who's literally a styling genius</div>
          <div class="feature-item">• All the luxury flatlays you need for content</div>
          <div class="feature-item">• Access to everything until you decide if you want more</div>
        </div>
        
        <p>Here's the thing - I could give you some generic pep talk about "believing in yourself" but honestly? Just upload a few selfies and let Maya work her magic. You'll see what I mean.</p>
        
        <p>No pressure. No weird sales stuff. Just good photos and maybe a little confidence boost along the way.</p>
        
        <div class="signature">
          <p>Talk soon,<br>Sandra</p>
          <p style="font-size: 12px; color: #999;">The girl who built this because she was tired of feeling invisible</p>
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
      <title>Holy sh*t, you did it!</title>
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
        
        <h1>${firstName ? `${firstName}, you absolute legend!` : 'You absolute legend!'}</h1>
        
        <div class="greeting">
          I'm not even kidding - you just made one of the best investments in yourself.
        </div>
        
        <p>Okay, real talk for a second. Most women spend YEARS talking themselves out of investing in their dreams. "Maybe next month," "I'm not ready," "I don't know if it'll work."</p>
        
        <p>But not you. You said "fuck it, I'm doing this." And honestly? That attitude right there is exactly why you're going to crush this.</p>
        
        <div style="text-align: center;">
          <a href="${workspaceUrl}" class="cta-button">Let's Build Your Empire</a>
        </div>
        
        <div class="feature-list">
          <h3 style="margin-top: 0; font-family: 'Times New Roman', serif;">What you just unlocked:</h3>
          <div class="feature-item">• 100 AI photos monthly (that's like 47 cents per professional photo)</div>
          <div class="feature-item">• Maya - your personal AI celebrity stylist who's obsessed with making you look incredible</div>
          <div class="feature-item">• Victoria - your AI brand strategist who builds websites that actually convert</div>
          <div class="feature-item">• Every single luxury flatlay collection for endless content</div>
          <div class="feature-item">• Custom domains so your website is actually YOURS</div>
          <div class="feature-item">• Direct access to my team when you need help</div>
        </div>
        
        <p>Here's what happens next: Upload some selfies, let Maya work her magic, then watch Victoria turn it all into a business that actually makes money.</p>
        
        <p>This isn't some "maybe someday" thing anymore. This is happening. Right now.</p>
        
        <p><strong>Welcome to the women who decided to stop waiting for permission.</strong></p>
        
        <div class="signature">
          <p>So damn proud of you,<br>Sandra</p>
          <p style="font-size: 12px; color: #999;">Your biggest fan (seriously)</p>
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
      <title>Okay let's do this thing</title>
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
        
        <h1>Well, look who actually did something...</h1>
        
        <p>Most people just scroll past and keep dreaming. But you? You actually signed up for something. That's already more than 90% of people do.</p>
        
        <p>Your 5 FREE photos are waiting, but real talk - this isn't really about the photos. It's about you finally seeing what everyone else sees when you stop hiding.</p>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div>Upload your phone selfies (literally just grab your phone)</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div>Maya (your AI stylist) helps you figure out what vibe you're going for</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div>Get back photos that make you go "wait, is that actually me?"</div>
          </div>
        </div>
        
        <p>No pressure, no weird sales calls, no "believe in yourself" bullshit. Just good photos.</p>
        
        <a href="${loginUrl}" class="cta-button">Okay Let's Do This</a>
        
        <p>This is how it starts. Not with some big dramatic moment, just with actually doing the thing.</p>
        
        <div class="signature">
          <p>Sandra<br>
          <em>The girl who gets it</em></p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 40px;">
          You signed up for this, so here's your welcome email. That's it - I'm not gonna spam you with daily "motivation" emails or whatever.
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
      <title>You actually bought it!</title>
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
        
        <h1>Wait, you actually bought it?</h1>
        
        <p>I'm sitting here looking at your order and honestly? I'm a little emotional. Do you know how many women spend MONTHS talking themselves out of investing in their dreams?</p>
        
        <p>But not you. You said "fuck it, I'm doing this." And that right there? That's exactly why you're going to absolutely crush this.</p>
        
        <div class="features">
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>100 AI photos monthly (that's like getting a professional photographer for 47 cents per shot)</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Maya - literally the best AI stylist I've ever seen (she's obsessed with making you look incredible)</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Victoria - your AI brand strategist who builds websites that actually convert</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Every single luxury flatlay collection (no more "I don't know what to post")</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Custom domains so your website is actually YOURS</div>
          </div>
          <div class="feature">
            <div class="feature-bullet">•</div>
            <div>Direct access to my team when you need help (we actually respond)</div>
          </div>
        </div>
        
        <p>This isn't some "maybe someday" thing anymore. This is happening. Right now.</p>
        
        <a href="${loginUrl}" class="cta-button">Let's Build Your Empire</a>
        
        <p>Welcome to the women who decided to stop waiting for permission to build something incredible.</p>
        
        <div class="signature">
          <p>So freaking proud of you,<br>Sandra<br>
          <em>Your biggest cheerleader</em></p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 40px;">
          You just invested in yourself. That's the hardest part - now we get to do the fun stuff.
        </p>
      </div>
    </body>
    </html>
  `;
}