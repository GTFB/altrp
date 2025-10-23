import { MONITORING } from '../../settings';

export interface MetricData {
	timestamp: number;
	projectId: string;
	value: number;
	metadata?: Record<string, any>;
}

export class MetricsCollector {
	constructor(private env: any) {}

	async recordRequest(projectId: string, latency: number, cost: number, status: string) {
		const timestamp = Date.now();
		
		// Record request count
		await this.recordMetric(MONITORING.METRICS.REQUEST_COUNT, {
			timestamp,
			projectId,
			value: 1,
			metadata: { status }
		});

		// Record latency
		await this.recordMetric(MONITORING.METRICS.REQUEST_LATENCY, {
			timestamp,
			projectId,
			value: latency,
			metadata: { status }
		});

		// Record cost
		await this.recordMetric(MONITORING.METRICS.COST_PER_REQUEST, {
			timestamp,
			projectId,
			value: cost,
			metadata: { status }
		});

		// Check for alerts
		await this.checkAlerts(projectId, latency, status);
	}

	async recordKeyRotation(projectId: string, provider: string, keyIndex: number) {
		await this.recordMetric(MONITORING.METRICS.KEY_ROTATION, {
			timestamp: Date.now(),
			projectId,
			value: keyIndex,
			metadata: { provider }
		});
	}

	private async recordMetric(metricName: string, data: MetricData) {
		const key = `metrics:${metricName}:${data.projectId}:${Math.floor(data.timestamp / 60000)}`;
		const existing = await this.env.RATE_LIMITS.get(key);
		const metrics = existing ? JSON.parse(existing) : [];
		
		metrics.push(data);
		
		// Keep only last 1000 metrics per minute
		if (metrics.length > 1000) {
			metrics.splice(0, metrics.length - 1000);
		}
		
		await this.env.RATE_LIMITS.put(key, JSON.stringify(metrics), { expirationTtl: 3600 });
	}

	private async checkAlerts(projectId: string, latency: number, status: string) {
		// Check error rate
		if (status === 'ERROR') {
			const errorRate = await this.calculateErrorRate(projectId);
			if (errorRate > MONITORING.THRESHOLDS.ERROR_RATE_CRITICAL) {
				await this.triggerAlert(MONITORING.ALERTS.HIGH_ERROR_RATE, projectId, { errorRate });
			}
		}

		// Check latency
		if (latency > MONITORING.THRESHOLDS.LATENCY_CRITICAL) {
			await this.triggerAlert('high_latency', projectId, { latency });
		}
	}

	private async calculateErrorRate(projectId: string): Promise<number> {
		const now = Date.now();
		const oneHourAgo = now - 3600000;
		
		const key = `metrics:${MONITORING.METRICS.REQUEST_COUNT}:${projectId}:${Math.floor(oneHourAgo / 60000)}`;
		const metrics = await this.env.RATE_LIMITS.get(key);
		
		if (!metrics) return 0;
		
		const data = JSON.parse(metrics);
		const total = data.length;
		const errors = data.filter((m: any) => m.metadata?.status === 'ERROR').length;
		
		return total > 0 ? errors / total : 0;
	}

	private async triggerAlert(alertType: string, projectId: string, data: any) {
		const alert = {
			timestamp: Date.now(),
			projectId,
			alertType,
			data
		};
		
		await this.env.RATE_LIMITS.put(
			`alerts:${projectId}:${Date.now()}`,
			JSON.stringify(alert),
			{ expirationTtl: 86400 }
		);
		
		console.log(`ALERT: ${alertType} for project ${projectId}`, data);
	}

	async getProjectMetrics(projectId: string, timeRange: '1h' | '24h' | '7d' = '24h') {
		const now = Date.now();
		const ranges = {
			'1h': 3600000,
			'24h': 86400000,
			'7d': 604800000
		};
		
		const since = now - ranges[timeRange];
		const metrics: Record<string, any[]> = {};
		
		for (const metricName of Object.values(MONITORING.METRICS)) {
			const key = `metrics:${metricName}:${projectId}:${Math.floor(since / 60000)}`;
			const data = await this.env.RATE_LIMITS.get(key);
			metrics[metricName] = data ? JSON.parse(data) : [];
		}
		
		return metrics;
	}
}
