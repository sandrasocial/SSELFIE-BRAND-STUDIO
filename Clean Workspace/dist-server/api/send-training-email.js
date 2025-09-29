export const config = { runtime: 'nodejs' };
import { EmailService } from '../server/email-service.js';
import { withAuth } from './_middleware/auth.js';
// Send training start email
export async function POST(req, res) {
    return withAuth(req, res, async (req, res) => {
        const { email, firstName } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        try {
            const result = await EmailService.sendTrainingStartedEmail(email, firstName);
            if (result.success) {
                return res.status(200).json({ success: true, emailId: result.emailId });
            }
            else {
                return res.status(500).json({ error: 'Failed to send training email' });
            }
        }
        catch (error) {
            console.error('Failed to send training email:', error);
            return res.status(500).json({
                error: 'Failed to send training email',
                message: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
