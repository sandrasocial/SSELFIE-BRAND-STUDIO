import * as fs from 'fs';
export class FileRegistrySystem {
    static instance;
    registryMap = new Map();
    registryFile = 'file-registry.json';
    constructor() {
        this.loadRegistry();
    }
    static getInstance() {
        if (!FileRegistrySystem.instance) {
            FileRegistrySystem.instance = new FileRegistrySystem();
        }
        return FileRegistrySystem.instance;
    }
    loadRegistry() {
        try {
            if (fs.existsSync(this.registryFile)) {
                const data = fs.readFileSync(this.registryFile, 'utf8');
                const parsed = JSON.parse(data);
                this.registryMap = new Map(Object.entries(parsed));
            }
        }
        catch (error) {
            console.error('Error loading registry:', error);
        }
    }
    saveRegistry() {
        try {
            const obj = Object.fromEntries(this.registryMap);
            fs.writeFileSync(this.registryFile, JSON.stringify(obj, null, 2));
        }
        catch (error) {
            console.error('Error saving registry:', error);
        }
    }
    fileExists(filename) {
        return this.registryMap.has(filename);
    }
    getFilePath(filename) {
        return this.registryMap.get(filename) || null;
    }
    registerFile(filename, filepath) {
        this.registryMap.set(filename, filepath);
        this.saveRegistry();
    }
    getAllRegisteredFiles() {
        return new Map(this.registryMap);
    }
}
