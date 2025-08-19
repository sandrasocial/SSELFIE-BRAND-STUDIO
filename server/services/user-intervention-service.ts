/**
 * USER INTERVENTION SERVICE
 * Automated outreach and support for inactive paid users
 */

import { db } from '../db.js';
import { users, selfieUploads, userModels } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

export class UserInterventionService {
  
  /**
   * Get paid users who need intervention (no uploads or models)
   */
  static async getInactiveUsers() {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        plan: users.plan,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        uploadCount: sql<number>`COUNT(${selfieUploads.id})`,
        modelCount: sql<number>`COUNT(${userModels.id})`
      })
      .from(users)
      .leftJoin(selfieUploads, eq(users.id, selfieUploads.userId))
      .leftJoin(userModels, eq(users.id, userModels.userId))
      .where(sql`${users.plan} != 'free'`)
      .groupBy(users.id, users.email, users.plan, users.firstName, users.lastName, users.createdAt)
      .having(sql`COUNT(${selfieUploads.id}) = 0`);

    return result;
  }

  /**
   * Generate personalized outreach email content
   */
  static generatePersonalizedEmail(user: any) {
    const name = user.firstName || user.email.split('@')[0];
    const planName = user.plan === 'sselfie-studio' ? 'SSELFIE Studio' : 
                    user.plan === 'full-access' ? 'Full Access' : 
                    user.plan.charAt(0).toUpperCase() + user.plan.slice(1);

    return {
      subject: `${name}, let's activate your ${planName} plan in just 5 minutes!`,
      html: `
        <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; font-size: 28px; margin: 0;">SSELFIE STUDIO</h1>
            <p style="color: #888; margin: 5px 0 0 0;">Personal Brand Photography</p>
          </div>
          
          <h2 style="color: #d4af37; font-size: 24px;">Hi ${name},</h2>
          
          <p style="line-height: 1.6; font-size: 16px;">
            I noticed you haven't uploaded your training images yet for your <strong>${planName}</strong> subscription. 
            You're missing out on creating stunning AI-generated professional photos!
          </p>
          
          <div style="background: #111; padding: 20px; margin: 20px 0; border-left: 3px solid #d4af37;">
            <h3 style="color: #d4af37; margin-top: 0;">Getting started is simple:</h3>
            <ol style="line-height: 1.8;">
              <li>Upload 15-20 high-quality selfies</li>
              <li>Your custom AI model trains automatically (24-48 hours)</li>
              <li>Generate unlimited professional brand photos</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sselfie.ai/workspace" 
               style="background: #d4af37; color: #000; padding: 15px 30px; text-decoration: none; 
                      font-weight: bold; border-radius: 5px; display: inline-block;">
              Start Uploading Now
            </a>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; color: #888;">
            Need help? Simply reply to this email - I personally respond to every message.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">Sandra | Founder, SSELFIE Studio</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Create intervention campaign tracking
   */
  static async trackInterventionSent(userId: string, campaignType: 'initial' | 'reminder_3d' | 'reminder_7d' | 'reminder_14d') {
    // Log intervention in database (could create intervention_logs table)
    console.log(`📧 INTERVENTION: ${campaignType} sent to user ${userId}`);
  }

  /**
   * Get intervention statistics
   */
  static async getInterventionStats() {
    const totalPaidUsers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(sql`${users.plan} != 'free'`);
    
    const inactiveUsers = await this.getInactiveUsers();
    
    return {
      totalPaidUsers: totalPaidUsers[0].count,
      inactiveUsers: inactiveUsers.length,
      activeUsers: totalPaidUsers[0].count - inactiveUsers.length,
      conversionRate: ((totalPaidUsers[0].count - inactiveUsers.length) / totalPaidUsers[0].count * 100).toFixed(1)
    };
  }
}