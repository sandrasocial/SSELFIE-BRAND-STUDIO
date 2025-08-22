import { performance } from 'perf_hooks';
import os from 'os';

export interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: {
        total: number;
        free: number;
        used: number;
    };
    processMemory: {
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
    uptime: number;
}

export class PerformanceMonitor {
    private startTime: number;
    
    constructor() {
        this.startTime = performance.now();
    }

    public getSystemMetrics(): SystemMetrics {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        return {
            cpuUsage: os.loadavg()[0],
            memoryUsage: {
                total: totalMem / 1024 / 1024, // MB
                free: freeMem / 1024 / 1024,   // MB
                used: usedMem / 1024 / 1024    // MB
            },
            processMemory: {
                heapTotal: process.memoryUsage().heapTotal / 1024 / 1024,
                heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
                external: process.memoryUsage().external / 1024 / 1024
            },
            uptime: os.uptime()
        };
    }

    public getProcessingTime(): number {
        return performance.now() - this.startTime;
    }

    public async logMetrics(modelId: string): Promise<void> {
        const metrics = this.getSystemMetrics();
        const processingTime = this.getProcessingTime();
        
        // Log to database
        await this.saveMetrics({
            modelId,
            processingTime,
            memoryUsage: metrics.memoryUsage.used,
            cpuUsage: metrics.cpuUsage,
            timestamp: new Date(),
            status: 'completed'
        });
    }

    private async saveMetrics(data: any): Promise<void> {
        // Implementation for database logging
        const query = `
            INSERT INTO processing_metrics 
            (processing_time, memory_usage, cpu_usage, model_id, status)
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        // Execute query logic here
    }
}