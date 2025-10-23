import { PROJECT_TEMPLATES, BUDGET_LIMITS } from '../../settings';

export interface ProjectConfig {
	id: string;
	name: string;
	monthlyBudget: number;
	currentUsage: number;
	rateLimits: {
		requestsPerMinute: number;
		requestsPerHour: number;
		requestsPerDay: number;
	};
	allowedModels: string[];
	features: {
		caching: boolean;
		analytics: boolean;
		keyRotation: boolean;
		priority?: boolean;
		customModels?: boolean;
		dedicatedKeys?: boolean;
	};
	createdAt: number;
	updatedAt: number;
}

export class ProjectManager {
	constructor(private env: any) {}

	async createProject(
		projectId: string, 
		template: keyof typeof PROJECT_TEMPLATES = 'DEFAULT',
		customConfig?: Partial<ProjectConfig>
	): Promise<ProjectConfig> {
		const baseConfig = PROJECT_TEMPLATES[template];
		const config: ProjectConfig = {
			id: projectId,
			name: customConfig?.name || baseConfig.name,
			monthlyBudget: customConfig?.monthlyBudget || baseConfig.monthlyBudget,
			currentUsage: 0,
			rateLimits: { ...baseConfig.rateLimits, ...customConfig?.rateLimits },
			allowedModels: [...baseConfig.allowedModels, ...(customConfig?.allowedModels || [])],
			features: { ...baseConfig.features, ...customConfig?.features },
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		// Store in KV for quick access
		await this.env.PROVIDERS_CONFIG.put(
			`project:${projectId}`,
			JSON.stringify(config)
		);

		// Also store in D1 for persistence
		await this.env.DB.prepare(`
			INSERT OR REPLACE INTO projects (id, name, monthlyBudget, currentUsage, createdAt, updatedAt)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(
			config.id,
			config.name,
			config.monthlyBudget,
			config.currentUsage,
			Math.floor(config.createdAt / 1000),
			Math.floor(config.updatedAt / 1000)
		).run();

		// Create permissions
		for (const modelPattern of config.allowedModels) {
			await this.env.DB.prepare(`
				INSERT OR REPLACE INTO project_permissions (projectId, modelPattern)
				VALUES (?, ?)
			`).bind(projectId, modelPattern).run();
		}

		return config;
	}

	async getProject(projectId: string): Promise<ProjectConfig | null> {
		// Try KV first for speed
		const cached = await this.env.PROVIDERS_CONFIG.get(`project:${projectId}`);
		if (cached) {
			return JSON.parse(cached);
		}

		// Fallback to D1
		const project = await this.env.DB.prepare(`
			SELECT * FROM projects WHERE id = ?
		`).bind(projectId).first();

		if (!project) {
			return null;
		}

		const permissions = await this.env.DB.prepare(`
			SELECT modelPattern FROM project_permissions WHERE projectId = ?
		`).bind(projectId).all();

		const config: ProjectConfig = {
			id: project.id,
			name: project.name,
			monthlyBudget: project.monthlyBudget,
			currentUsage: project.currentUsage,
			rateLimits: {
				requestsPerMinute: 60, // Default, should be stored in D1
				requestsPerHour: 1000,
				requestsPerDay: 10000
			},
			allowedModels: permissions.results.map((p: any) => p.modelPattern),
			features: {
				caching: true,
				analytics: true,
				keyRotation: true
			},
			createdAt: project.createdAt * 1000,
			updatedAt: project.updatedAt * 1000
		};

		// Cache in KV
		await this.env.PROVIDERS_CONFIG.put(
			`project:${projectId}`,
			JSON.stringify(config),
			{ expirationTtl: 3600 } // 1 hour cache
		);

		return config;
	}

	async updateProject(projectId: string, updates: Partial<ProjectConfig>): Promise<ProjectConfig | null> {
		const current = await this.getProject(projectId);
		if (!current) {
			return null;
		}

		const updated: ProjectConfig = {
			...current,
			...updates,
			updatedAt: Date.now()
		};

		// Update KV cache
		await this.env.PROVIDERS_CONFIG.put(
			`project:${projectId}`,
			JSON.stringify(updated)
		);

		// Update D1
		await this.env.DB.prepare(`
			UPDATE projects 
			SET name = ?, monthlyBudget = ?, currentUsage = ?, updatedAt = ?
			WHERE id = ?
		`).bind(
			updated.name,
			updated.monthlyBudget,
			updated.currentUsage,
			Math.floor(updated.updatedAt / 1000),
			projectId
		).run();

		return updated;
	}

	async updateUsage(projectId: string, additionalCost: number): Promise<void> {
		await this.env.DB.prepare(`
			UPDATE projects 
			SET currentUsage = currentUsage + ?, updatedAt = ?
			WHERE id = ?
		`).bind(additionalCost, Math.floor(Date.now() / 1000), projectId).run();

		// Invalidate cache
		await this.env.PROVIDERS_CONFIG.delete(`project:${projectId}`);
	}

	async checkBudget(projectId: string): Promise<{ withinBudget: boolean; usagePercentage: number }> {
		const project = await this.getProject(projectId);
		if (!project) {
			return { withinBudget: false, usagePercentage: 0 };
		}

		const usagePercentage = project.currentUsage / project.monthlyBudget;
		return {
			withinBudget: usagePercentage < 1.0,
			usagePercentage
		};
	}

	async listProjects(): Promise<ProjectConfig[]> {
		const projects = await this.env.DB.prepare(`
			SELECT * FROM projects ORDER BY createdAt DESC
		`).all();

		const configs: ProjectConfig[] = [];
		for (const project of projects.results) {
			const config = await this.getProject(project.id);
			if (config) {
				configs.push(config);
			}
		}

		return configs;
	}
}
