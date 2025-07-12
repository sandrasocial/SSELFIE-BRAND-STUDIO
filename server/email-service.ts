import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing required Resend API key: RESEND_API_KEY');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendSelfieQueenGuide(userEmail: string, source: string): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Sandra from SSELFIE STUDIO <hello@sselfie.ai>',
        to: [userEmail],
        subject: 'Your Selfie Queen Guide is here 📸',
        html: this.getSelfieQueenGuideTemplate(userEmail, source),
      });

      if (error) {
        console.error('Resend email error:', error);
        throw new Error(`Failed to send guide: ${error.message}`);
      }

      console.log('Selfie Queen Guide sent successfully:', data?.id);
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string, plan: string): Promise<void> {
    try {
      const planDetails = this.getPlanDetails(plan);
      const ctaUrl = 'https://sselfie.replit.app/onboarding';
      
      const { data, error } = await resend.emails.send({
        from: 'Sandra from SSELFIE STUDIO <hello@sselfie.ai>',
        to: [userEmail],
        subject: 'Welcome to SSELFIE STUDIO — Your transformation starts now',
        html: this.getWelcomeEmailTemplate(userName, planDetails, ctaUrl),
      });

      if (error) {
        console.error('Resend email error:', error);
        throw new Error(`Failed to send welcome email: ${error.message}`);
      }

      console.log('Welcome email sent successfully:', data?.id);
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  private static getPlanDetails(plan: string) {
    switch (plan) {
      case 'ai-pack':
        return {
          name: 'SSELFIE AI Pack',
          price: '€47',
          description: '250 AI generations + gallery'
        };
      case 'studio':
        return {
          name: 'SSELFIE Studio',
          price: '€97',
          description: 'Everything + landing page builder + 100 monthly generations'
        };
      case 'studio-pro':
        return {
          name: 'SSELFIE Studio Pro',
          price: '€147',
          description: 'Everything + 1:1 setup call + 250 monthly generations'
        };
      default:
        return {
          name: 'SSELFIE AI Pack',
          price: '€47',
          description: '250 AI generations + gallery'
        };
    }
  }

  private static getSelfieQueenGuideTemplate(userEmail: string, source: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Selfie Queen Guide</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0a0a0a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #0a0a0a; color: #ffffff; text-align: center; padding: 40px 30px; }
        .title { font-family: 'Times New Roman', serif; font-size: 36px; font-weight: 300; margin: 0; line-height: 1.2; }
        .subtitle { font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; margin: 16px 0 0 0; opacity: 0.8; }
        .content { padding: 40px 30px; }
        .section { margin-bottom: 40px; }
        .serif { font-family: 'Times New Roman', serif; }
        .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .btn { display: inline-block; background: #0a0a0a; color: #ffffff; text-decoration: none; padding: 16px 32px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; border: 2px solid #0a0a0a; transition: all 0.3s; }
        .btn:hover { background: #ffffff; color: #0a0a0a; }
        .quote { font-style: italic; text-align: center; font-size: 24px; margin: 40px 0; color: #333; }
        .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">The Selfie Queen Guide</h1>
            <p class="subtitle">My gift to you</p>
        </div>
        
        <div class="content">
            <div class="section">
                <p class="sans">Hey beautiful,</p>
                <p class="sans">This isn't just another PDF. This is everything I wish someone handed me when I started—angles, light, editing, confidence, and a challenge for when you're ready to show up for real.</p>
            </div>
            
            <div class="section" style="text-align: center; background: #f8f8f8; padding: 30px; margin: 40px 0;">
                <h2 class="serif" style="margin: 0 0 16px 0; font-size: 24px;">Inside The Guide:</h2>
                <ul style="list-style: none; padding: 0; margin: 0; text-align: left; display: inline-block;">
                    <li style="margin-bottom: 12px;">✓ The 5 angles that make everyone look stunning</li>
                    <li style="margin-bottom: 12px;">✓ Natural light secrets (no ring light needed)</li>
                    <li style="margin-bottom: 12px;">✓ How to edit like a pro in 3 minutes</li>
                    <li style="margin-bottom: 12px;">✓ Confidence hacks that actually work</li>
                    <li style="margin-bottom: 12px;">✓ The 30-day selfie challenge</li>
                </ul>
            </div>
            
            <div class="section" style="text-align: center;">
                <a href="https://drive.google.com/file/d/your-guide-link/view" class="btn">DOWNLOAD YOUR GUIDE</a>
            </div>
            
            <div class="quote serif">
                "When you show up as her? Everything changes."
            </div>
            
            <div class="section">
                <p class="sans">Ready to turn your selfies into a business? SSELFIE Studio creates professional AI photoshoots in minutes. Same confidence-building magic, but for your brand.</p>
                <p class="sans" style="text-align: center; margin-top: 30px;">
                    <a href="https://sselfie.replit.app" style="color: #0a0a0a; text-decoration: underline;">Check out SSELFIE Studio →</a>
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>You're receiving this because you requested The Selfie Queen Guide.</p>
            <p style="margin-top: 20px;">
                SSELFIE STUDIO<br>
                <a href="#" style="color: #666;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  private static getWelcomeEmailTemplate(userName: string, planDetails: any, ctaUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Welcome to SSELFIE STUDIO</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Email Client Reset */
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #ffffff;
        }
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }
        table, td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Typography */
        .serif {
            font-family: 'Times New Roman', Times, serif !important;
            font-weight: 300;
            letter-spacing: -0.01em;
        }
        .sans {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            font-weight: 300;
        }
        .eyebrow {
            font-size: 11px !important;
            letter-spacing: 0.4em !important;
            text-transform: uppercase !important;
            color: #666666 !important;
            margin: 0 0 16px 0 !important;
            line-height: 1.4 !important;
        }
        .headline {
            font-size: 32px !important;
            line-height: 1.1 !important;
            color: #0a0a0a !important;
            margin: 0 0 24px 0 !important;
        }
        .subhead {
            font-size: 18px !important;
            line-height: 1.5 !important;
            color: #0a0a0a !important;
            margin: 0 0 32px 0 !important;
        }
        .body {
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: #0a0a0a !important;
            margin: 0 0 20px 0 !important;
        }
        .small {
            font-size: 14px !important;
            line-height: 1.5 !important;
            color: #666666 !important;
        }

        /* Layout */
        .container {
            max-width: 600px !important;
            margin: 0 auto !important;
            background: #ffffff;
        }
        .section {
            padding: 40px 30px !important;
        }
        .section-dark {
            background: #0a0a0a !important;
            color: #ffffff !important;
        }
        .section-gray {
            background: #f5f5f5 !important;
        }

        /* Buttons */
        .btn {
            display: inline-block !important;
            padding: 16px 32px !important;
            background: #0a0a0a !important;
            color: #ffffff !important;
            text-decoration: none !important;
            font-size: 11px !important;
            letter-spacing: 0.3em !important;
            text-transform: uppercase !important;
            border: none !important;
            text-align: center !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            font-weight: 400 !important;
        }
        .btn-white {
            background: #ffffff !important;
            color: #0a0a0a !important;
        }

        /* Mobile Responsive */
        @media screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .section {
                padding: 30px 20px !important;
            }
            .headline {
                font-size: 28px !important;
            }
            .subhead {
                font-size: 16px !important;
            }
            .mobile-center {
                text-align: center !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .dark-mode-bg {
                background: #ffffff !important;
            }
            .dark-mode-text {
                color: #0a0a0a !important;
            }
        }
    </style>
</head>
<body>
    <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Welcome to SSELFIE STUDIO — where your brand starts with a selfie
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td>
                <div class="container">
                    
                    <!-- Header -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section" style="text-align: center; padding-bottom: 0;">
                                <div class="eyebrow sans">SSELFIE STUDIO</div>
                            </td>
                        </tr>
                    </table>

                    <!-- Hero Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section" style="text-align: center;">
                                <h1 class="headline serif">This didn't start as a business.<br>It started as survival.</h1>
                                <p class="subhead sans">Hey beautiful — Sandra here. And I'm so damn proud you're taking this step.</p>
                            </td>
                        </tr>
                    </table>

                    <!-- Story Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section">
                                <p class="body sans">One year ago, I was exactly where you might be right now.</p>
                                
                                <p class="body sans">Divorced. Three kids. Zero plan. Hiding from cameras because I didn't recognize the woman looking back at me.</p>
                                
                                <p class="body sans">But here's what I figured out: You don't need a full rebrand. You don't need fancy equipment or a design degree.</p>
                                
                                <p class="body sans">You just need your face, your story, and about twenty minutes.</p>
                                
                                <p class="body sans">That's exactly what SSELFIE STUDIO gives you.</p>
                            </td>
                        </tr>
                    </table>

                    <!-- CTA Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section section-dark" style="text-align: center;">
                                <h2 class="headline serif" style="color: #ffffff; margin-bottom: 16px;">Ready to build something real?</h2>
                                <p class="body sans" style="color: #ffffff; margin-bottom: 32px;">Your AI-powered brand studio is waiting.</p>
                                <a href="${ctaUrl}" class="btn btn-white">START YOUR STUDIO</a>
                            </td>
                        </tr>
                    </table>

                    <!-- What's Next Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section section-gray">
                                <div class="eyebrow sans">WHAT HAPPENS NEXT</div>
                                <h3 class="headline serif" style="font-size: 24px;">Three steps. That's it.</h3>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                                    <tr>
                                        <td style="padding-bottom: 24px;">
                                            <div class="eyebrow sans">STEP 01</div>
                                            <p class="body sans" style="margin: 8px 0 0 0;"><strong>Upload 10-15 selfies</strong><br>Face the window, wear what you love. No ring light needed.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 24px;">
                                            <div class="eyebrow sans">STEP 02</div>
                                            <p class="body sans" style="margin: 8px 0 0 0;"><strong>Pick your vibe</strong><br>Choose your niche, your look, your dream client energy.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 0;">
                                            <div class="eyebrow sans">STEP 03</div>
                                            <p class="body sans" style="margin: 8px 0 0 0;"><strong>Watch the magic</strong><br>Your AI creates a whole editorial gallery. Instantly.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- Quote Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section" style="text-align: center; padding: 60px 30px;">
                                <p class="serif" style="font-size: 24px; line-height: 1.3; color: #0a0a0a; font-style: italic; margin: 0;">"Your mess is your message.<br>Let's turn it into money."</p>
                            </td>
                        </tr>
                    </table>

                    <!-- Footer -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td class="section" style="text-align: center; border-top: 1px solid #e5e5e5;">
                                <p class="small sans">You're receiving this because you joined SSELFIE STUDIO.<br>Ready to show up as her? Let's build something real together.</p>
                                
                                <p class="small sans" style="margin-top: 32px;">
                                    SSELFIE STUDIO<br>
                                    <a href="#" style="color: #666666;">Unsubscribe</a> | <a href="#" style="color: #666666;">Update preferences</a>
                                </p>
                            </td>
                        </tr>
                    </table>

                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }
}