const sharp = (buffer) => ({
    resize: (width, height) => ({
        jpeg: () => ({
            toBuffer: async () => {
                console.warn('Using placeholder sharp. Implement actual image compression.');
                return buffer;
            }
        })
    })
});
export default sharp;
//# sourceMappingURL=image-compression-placeholder.js.map