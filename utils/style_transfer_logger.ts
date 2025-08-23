import { Pool } from 'pg';
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';

export class StyleTransferLogger {
    private pool: Pool;
    private requestId: string;
    private startTime: number;
    private userId?: number;

    constructor(pool: Pool, userId?: number) {
        this.pool = pool;
        this.requestId = uuidv4();
        this.startTime = performance.now();
        this.userId = userId;
    }

    async logStart(): Promise<void> {
        await this.pool.query(
            'INSERT INTO style_transfer_logs (request_id, user_id, start_timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [this.requestId, this.userId]
        );
    }

    async logCompletion(metrics: {
        memoryUsage: number,
        cpuUtilization: number,
        gpuUtilization: number,
        status: string,
        errorMessage?: string,
        inputImageSize?: number,
        outputImageSize?: number,
        styleModelUsed?: string
    }): Promise<void> {
        const processingTime = Math.round(performance.now() - this.startTime);
        
        await this.pool.query(
            `UPDATE style_transfer_logs 
             SET end_timestamp = CURRENT_TIMESTAMP,
                 processing_time_ms = $1,
                 memory_usage_mb = $2,
                 cpu_utilization_percent = $3,
                 gpu_utilization_percent = $4,
                 status = $5,
                 error_message = $6,
                 input_image_size = $7,
                 output_image_size = $8,
                 style_model_used = $9
             WHERE request_id = $10`,
            [
                processingTime,
                metrics.memoryUsage,
                metrics.cpuUtilization,
                metrics.gpuUtilization,
                metrics.status,
                metrics.errorMessage || null,
                metrics.inputImageSize || null,
                metrics.outputImageSize || null,
                metrics.styleModelUsed || null,
                this.requestId
            ]
        );
    }

    async getMetrics(): Promise<any> {
        const result = await this.pool.query(
            'SELECT * FROM style_transfer_logs WHERE request_id = $1',
            [this.requestId]
        );
        return result.rows[0];
    }

    static async getAggregateMetrics(pool: Pool, timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total_requests,
                AVG(processing_time_ms) as avg_processing_time,
                AVG(memory_usage_mb) as avg_memory_usage,
                AVG(cpu_utilization_percent) as avg_cpu_utilization,
                AVG(gpu_utilization_percent) as avg_gpu_utilization,
                COUNT(CASE WHEN status = 'success' THEN 1 END)::float / COUNT(*) * 100 as success_rate
            FROM style_transfer_logs
            WHERE created_at >= NOW() - interval '1 ${timeframe}'
        `;
        
        const result = await pool.query(query);
        return result.rows[0];
    }
}