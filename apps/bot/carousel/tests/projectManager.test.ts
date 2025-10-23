import { describe, it, expect, beforeEach } from 'bun:test';
import { ProjectManager } from '../src/services/projectManager';
import { mockEnv } from './setup';

describe('ProjectManager', () => {
	let projectManager: ProjectManager;

	beforeEach(() => {
		projectManager = new ProjectManager(mockEnv);
	});

	describe('createProject', () => {
		it('should create project with default template', async () => {
			const project = await projectManager.createProject('test-project');
			
			expect(project.id).toBe('test-project');
			expect(project.name).toBe('Default Project');
			expect(project.monthlyBudget).toBe(1000);
			expect(project.features.caching).toBe(true);
		});

		it('should create project with premium template', async () => {
			const project = await projectManager.createProject('premium-project', 'PREMIUM');
			
			expect(project.monthlyBudget).toBe(5000);
			expect(project.rateLimits.requestsPerMinute).toBe(200);
			expect(project.features.priority).toBe(true);
		});

		it('should create project with custom config', async () => {
			const customConfig = {
				name: 'Custom Project',
				monthlyBudget: 2000,
				features: { caching: false }
			};
			
			const project = await projectManager.createProject('custom-project', 'DEFAULT', customConfig);
			
			expect(project.name).toBe('Custom Project');
			expect(project.monthlyBudget).toBe(2000);
			expect(project.features.caching).toBe(false);
		});
	});

	describe('checkBudget', () => {
		it('should return within budget for low usage', async () => {
			// Mock project with low usage
			mockEnv.PROVIDERS_CONFIG.get = (key: string) => {
				if (key === 'project:test-project') {
					return Promise.resolve(JSON.stringify({
						id: 'test-project',
						monthlyBudget: 1000,
						currentUsage: 100
					}));
				}
				return Promise.resolve(null);
			};

			const result = await projectManager.checkBudget('test-project');
			
			expect(result.withinBudget).toBe(true);
			expect(result.usagePercentage).toBe(0.1);
		});

		it('should return over budget for high usage', async () => {
			// Mock project with high usage
			mockEnv.PROVIDERS_CONFIG.get = (key: string) => {
				if (key === 'project:test-project') {
					return Promise.resolve(JSON.stringify({
						id: 'test-project',
						monthlyBudget: 1000,
						currentUsage: 1200
					}));
				}
				return Promise.resolve(null);
			};

			const result = await projectManager.checkBudget('test-project');
			
			expect(result.withinBudget).toBe(false);
			expect(result.usagePercentage).toBe(1.2);
		});
	});
});
