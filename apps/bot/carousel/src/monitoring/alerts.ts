import { MONITORING, BUDGET_LIMITS } from '../../settings';

export interface Alert {
	id: string;
	timestamp: number;
	projectId: string;
	alertType: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	message: string;
	data: any;
	resolved: boolean;
}

export class AlertManager {
	constructor(private env: any) {}

	async checkBudgetAlerts(projectId: string, currentUsage: number, monthlyBudget: number) {
		const usagePercentage = currentUsage / monthlyBudget;
		
		if (usagePercentage >= BUDGET_LIMITS.EMERGENCY_THRESHOLD) {
			await this.createAlert({
				projectId,
				alertType: MONITORING.ALERTS.BUDGET_EXCEEDED,
				severity: 'critical',
				message: `Budget exceeded: $${currentUsage.toFixed(2)} / $${monthlyBudget}`,
				data: { currentUsage, monthlyBudget, usagePercentage }
			});
		} else if (usagePercentage >= BUDGET_LIMITS.WARNING_THRESHOLD) {
			await this.createAlert({
				projectId,
				alertType: MONITORING.ALERTS.BUDGET_WARNING,
				severity: 'high',
				message: `Budget warning: $${currentUsage.toFixed(2)} / $${monthlyBudget} (${(usagePercentage * 100).toFixed(1)}%)`,
				data: { currentUsage, monthlyBudget, usagePercentage }
			});
		}
	}

	async checkErrorRateAlerts(projectId: string, errorRate: number) {
		if (errorRate >= MONITORING.THRESHOLDS.ERROR_RATE_CRITICAL) {
			await this.createAlert({
				projectId,
				alertType: MONITORING.ALERTS.HIGH_ERROR_RATE,
				severity: 'critical',
				message: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
				data: { errorRate }
			});
		}
	}

	async checkRateLimitAlerts(projectId: string, requestCount: number, limit: number) {
		if (requestCount >= limit) {
			await this.createAlert({
				projectId,
				alertType: MONITORING.ALERTS.RATE_LIMIT_EXCEEDED,
				severity: 'medium',
				message: `Rate limit exceeded: ${requestCount} / ${limit}`,
				data: { requestCount, limit }
			});
		}
	}

	private async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) {
		const alert: Alert = {
			id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			resolved: false,
			...alertData
		};

		await this.env.RATE_LIMITS.put(
			`alerts:${alert.projectId}:${alert.id}`,
			JSON.stringify(alert),
			{ expirationTtl: 86400 * 7 } // Keep for 7 days
		);

		// Send notification (implement based on your notification system)
		await this.sendNotification(alert);
	}

	private async sendNotification(alert: Alert) {
		// Implement notification logic (email, Slack, Discord, etc.)
		console.log(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`, alert.data);
		
		// Example: Send to Telegram if configured
		if (this.env.TELEGRAM_BOT_TOKEN && this.env.TELEGRAM_CHAT_ID) {
			await this.sendTelegramAlert(alert);
		}
	}

	private async sendTelegramAlert(alert: Alert) {
		const emoji = {
			low: '🟡',
			medium: '🟠', 
			high: '🔴',
			critical: '🚨'
		}[alert.severity];

		const message = `${emoji} *${alert.alertType}*\n` +
			`Project: ${alert.projectId}\n` +
			`Message: ${alert.message}\n` +
			`Time: ${new Date(alert.timestamp).toISOString()}`;

		try {
			await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat_id: this.env.TELEGRAM_CHAT_ID,
					text: message,
					parse_mode: 'Markdown'
				})
			});
		} catch (error) {
			console.error('Failed to send Telegram alert:', error);
		}
	}

	async getProjectAlerts(projectId: string, resolved: boolean = false): Promise<Alert[]> {
		const alerts: Alert[] = [];
		
		// Get all alert keys for this project
		const keys = await this.env.RATE_LIMITS.list({ prefix: `alerts:${projectId}:` });
		
		for (const key of keys.keys) {
			const alertData = await this.env.RATE_LIMITS.get(key.name);
			if (alertData) {
				const alert = JSON.parse(alertData) as Alert;
				if (resolved === undefined || alert.resolved === resolved) {
					alerts.push(alert);
				}
			}
		}
		
		return alerts.sort((a, b) => b.timestamp - a.timestamp);
	}

	async resolveAlert(projectId: string, alertId: string) {
		const key = `alerts:${projectId}:${alertId}`;
		const alertData = await this.env.RATE_LIMITS.get(key);
		
		if (alertData) {
			const alert = JSON.parse(alertData) as Alert;
			alert.resolved = true;
			await this.env.RATE_LIMITS.put(key, JSON.stringify(alert), { expirationTtl: 86400 * 7 });
		}
	}
}
