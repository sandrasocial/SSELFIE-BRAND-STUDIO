// SSELFIE Studio Email Service - Resend Integration
// Invisible Empire Architecture for 87% Profit Margins

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable must be set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const SSELFIE_CONFIG = {
  from: 'SSELFIE Studio <studio@sselfie.ai>',
  replyTo: 'support@sselfie.ai',
};

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  tags?: Array<{ name: string; value: string; }>;
}

// Core email sending function
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from: SSELFIE_CONFIG.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: SSELFIE_CONFIG.replyTo,
      tags: params.tags || []
    });

    console.log('Email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Welcome sequence emails
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const html = `
    <div style="font-family: Times New Roman, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #0a0a0a; font-size: 28px; margin-bottom: 10px;">Welcome to SSELFIE Studio</h1>
        <p style="color: #666; font-size: 18px; margin: 0;">Your Personal Brand transformation begins now</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; margin-bottom: 30px;">
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${userName},
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          You've just joined something extraordinary. SSELFIE Studio isn't just another AI tool - it's your personal brand transformation partner.
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Over the next few days, I'll personally guide you through creating your custom AI model and building a personal brand that truly reflects who you are.
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6;">
          Ready to begin? Your first step is uploading your training photos.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sselfie.ai/workspace" style="background: #0a0a0a; color: white; padding: 15px 30px; text-decoration: none; font-size: 16px;">
          Start Your Training
        </a>
      </div>
      
      <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px; text-align: center;">
        <p style="color: #666; font-size: 14px;">
          Questions? Simply reply to this email.<br>
          Sandra & the SSELFIE Studio team
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to Your Personal Brand Revolution',
    html,
    tags: ['welcome', 'onboarding']
  });
}

// AI training completion notification
export async function sendTrainingCompleteEmail(userEmail: string, userName: string): Promise<boolean> {
  const html = `
    <div style="font-family: Times New Roman, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #0a0a0a; font-size: 28px; margin-bottom: 10px;">Your AI Model is Ready!</h1>
        <p style="color: #666; font-size: 18px; margin: 0;">Time to create something amazing</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; margin-bottom: 30px;">
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${userName}, this is exciting!
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Your custom AI model has finished training and is now ready to transform your selfies into professional, editorial-quality images.
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6;">
          Maya, your AI photographer, is standing by to help you create your first set of stunning photos.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sselfie.ai/ai-photoshoot" style="background: #0a0a0a; color: white; padding: 15px 30px; text-decoration: none; font-size: 16px;">
          Create Your First Photos
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Your AI Model is Live and Ready to Create',
    html,
    tags: ['training-complete', 'ai-ready']
  });
}

// Generation limit warning
export async function sendLimitWarningEmail(userEmail: string, userName: string, percentage: number, planType: string): Promise<boolean> {
  const isUpgrade = planType === 'basic';
  
  const html = `
    <div style="font-family: Times New Roman, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #0a0a0a; font-size: 28px; margin-bottom: 10px;">
          ${percentage >= 100 ? 'Monthly Limit Reached' : 'Almost at Your Monthly Limit'}
        </h1>
        <p style="color: #666; font-size: 18px; margin: 0;">
          ${percentage >= 100 ? 'Time to upgrade or wait for next month' : `You've used ${percentage}% of this month's generations`}
        </p>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; margin-bottom: 30px;">
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${userName},
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          You've been creating amazing content this month! 
          ${percentage >= 100 
            ? "You've reached your monthly generation limit." 
            : `You're ${percentage >= 90 ? 'almost' : 'getting close to'} your monthly limit.`}
        </p>
        ${isUpgrade && percentage >= 75 ? `
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ready to unlock unlimited creativity? Upgrade to Full Access for 5x more generations plus premium features.
        </p>
        ` : ''}
      </div>
      
      ${isUpgrade && percentage >= 75 ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sselfie.ai/pricing" style="background: #0a0a0a; color: white; padding: 15px 30px; text-decoration: none; font-size: 16px;">
          Upgrade to Full Access
        </a>
      </div>
      ` : ''}
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: percentage >= 100 ? 'Monthly Generation Limit Reached' : 'Generation Limit Warning',
    html,
    tags: ['limit-warning', planType]
  });
}

// Upgrade invitation email
export async function sendUpgradeInviteEmail(userEmail: string, userName: string): Promise<boolean> {
  const html = `
    <div style="font-family: Times New Roman, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #0a0a0a; font-size: 28px; margin-bottom: 10px;">Ready to Unlock Your Full Potential?</h1>
        <p style="color: #666; font-size: 18px; margin: 0;">Transform your Personal Brand with Full Access features</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; margin-bottom: 30px;">
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${userName},
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          You've been creating incredible content with SSELFIE Studio. I can see your Personal Brand taking shape.
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ready to take it to the next level? Full Access gives you 5x more generations, priority support, and Victoria AI to build your complete digital presence.
        </p>
        <p style="color: #0a0a0a; font-size: 16px; line-height: 1.6;">
          Join thousands of creators who've transformed their Personal Brand with Full Access.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://sselfie.ai/pricing" style="background: #0a0a0a; color: white; padding: 15px 30px; text-decoration: none; font-size: 16px;">
          Upgrade to Full Access - €67/month
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Unlock Your Personal Brand Potential',
    html,
    tags: ['upgrade-invite', 'conversion']
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendTrainingCompleteEmail,
  sendLimitWarningEmail,
  sendUpgradeInviteEmail
};