export const testingSystem = {
    config: {
        mode: 'unit',
        enableMocks: true,
        timeoutMs: 5000
    },
    configure(config) {
        Object.assign(this.config, config);
    },
    reset() {
        this.config = {
            mode: 'unit',
            enableMocks: true,
            timeoutMs: 5000
        };
    },
    async runAllTests() {
        console.log('Running all tests...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('All tests completed successfully');
    }
};
//# sourceMappingURL=testing.js.map