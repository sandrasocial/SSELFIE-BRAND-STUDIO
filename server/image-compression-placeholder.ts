// Placeholder for sharp module
export default {
  resize: () => ({ toBuffer: () => Promise.resolve(Buffer.from('')) }),
  jpeg: () => ({ toBuffer: () => Promise.resolve(Buffer.from('')) }),
  png: () => ({ toBuffer: () => Promise.resolve(Buffer.from('')) }),
  webp: () => ({ toBuffer: () => Promise.resolve(Buffer.from('')) })
};
