export const persistMayaChat = async (sessionId: string, messages: any[]) => {
  try {
    await db.mayaChatMessages.bulkCreate(
      messages.map(msg => ({
        sessionId,
        content: msg.content,
        role: msg.role,
        timestamp: new Date()
      }))
    );
    
    return { success: true };
  } catch (error) {
    return handleMayaChatError(error, sessionId);
  }
};