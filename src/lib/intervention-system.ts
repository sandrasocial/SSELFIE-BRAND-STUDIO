import { checkInactiveUploads } from './upload-tracking';
import { sendEmail } from './email-service';

export async function checkForInactiveUsers() {
  const inactiveUsers = await checkInactiveUploads();
  
  for (const user of inactiveUsers) {
    await sendInterventionEmail(user);
  }
  
  return inactiveUsers.length;
}

async function sendInterventionEmail(user: any) {
  const template = `
    Hi there!
    
    We noticed you haven't completed your photo uploads yet. 
    You currently have ${user.upload_count} photos uploaded.
    
    Need help? Just reply to this email and we'll guide you through the process.
    
    Best regards,
    The SSELFIE Studio Team
  `;
  
  await sendEmail({
    to: user.email,
    subject: 'Complete Your SSELFIE Studio Setup',
    text: template
  });
}

export async function monitorUploadProgress() {
  // Check every 24 hours
  setInterval(async () => {
    const inactiveCount = await checkForInactiveUsers();
    console.log(`Found ${inactiveCount} inactive users`);
  }, 24 * 60 * 60 * 1000);
}