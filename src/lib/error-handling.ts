export const handleStyleTransferError = async (error: Error, userId: string) => {
  await logError({
    type: 'style_transfer',
    userId,
    error: error.message,
    timestamp: new Date()
  });
  
  return {
    success: false,
    error: 'Style transfer failed. Please try again.',
    code: 'STYLE_TRANSFER_ERROR'
  };
};

export const handleMayaChatError = async (error: Error, sessionId: string) => {
  await logError({
    type: 'maya_chat',
    sessionId,
    error: error.message,
    timestamp: new Date()
  });

  return {
    success: false,
    error: 'Chat system temporarily unavailable. Please try again.',
    code: 'MAYA_CHAT_ERROR'
  };
};

export const handleGalleryError = async (error: Error, userId: string) => {
  await logError({
    type: 'gallery',
    userId, 
    error: error.message,
    timestamp: new Date()
  });

  return {
    success: false,
    error: 'Gallery unavailable. Please refresh the page.',
    code: 'GALLERY_ERROR'
  };
};