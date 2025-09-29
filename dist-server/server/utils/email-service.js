export async function sendEmail(request) {
    try {
        console.log('📧 EMAIL ESCALATION:', {
            to: request.to,
            subject: request.subject,
            priority: request.priority || 'normal',
            timestamp: new Date().toISOString()
        });
        console.log('📧 EMAIL CONTENT:');
        console.log(request.content);
        console.log('📧 EMAIL END');
        return true;
    }
    catch (error) {
        console.error('Email service error:', error);
        return false;
    }
}
//# sourceMappingURL=email-service.js.map