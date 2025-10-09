// Using built-in KVNamespace type from Cloudflare Workers
import type { KVNamespace } from '@cloudflare/workers-types';

export interface User {
  userId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  registeredAt: string;
  topicId?: number;
  language?: string; // User language
}

export class KVStorageService {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async initialize(): Promise<void> {
    console.log('KV Storage Service initialized');
  }

  async addUser(user: User): Promise<void> {
    console.log(`Adding user ${user.userId} to KV storage`);
    
    const userKey = `user:${user.userId}`;
    const existingUser = await this.kv.get(userKey);
    
    if (!existingUser) {
      await this.kv.put(userKey, JSON.stringify(user));
      console.log(`User ${user.userId} added to KV storage`);
    } else {
      console.log(`User ${user.userId} already exists in KV storage`);
    }
  }

  async getUser(userId: number): Promise<User | null> {
    console.log(`Getting user ${userId} from KV storage`);
    
    const userKey = `user:${userId}`;
    const userData = await this.kv.get(userKey);
    
    if (userData) {
      const user: User = JSON.parse(userData);
      console.log(`User ${userId} found with topicId: ${user.topicId}`);
      return user;
    } else {
      console.log(`User ${userId} not found in KV storage`);
      return null;
    }
  }

  async updateUserTopic(userId: number, topicId: number): Promise<void> {
    console.log(`Updating topic for user ${userId} to ${topicId}`);
    
    const userKey = `user:${userId}`;
    const userData = await this.kv.get(userKey);
    
    if (userData) {
      const user: User = JSON.parse(userData);
      user.topicId = topicId;
      await this.kv.put(userKey, JSON.stringify(user));
      console.log(`Topic updated for user ${userId}`);
    } else {
      console.log(`User ${userId} not found for topic update`);
    }
  }

  async getUserIdByTopic(topicId: number): Promise<number | undefined> {
    console.log(`Getting userId by topic ${topicId}`);
    
    // Get list of all users
    const users = await this.getAllUsers();
    const user = users.find(u => u.topicId === topicId);
    
    if (user) {
      console.log(`Found userId ${user.userId} for topic ${topicId}`);
      return user.userId;
    }
    
    console.log(`No user found for topic ${topicId}`);
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    // In real application, use list() to get all keys here
    // For simplicity, return empty array
    // TODO: Implement getting all users through KV list
    return [];
  }

  // Methods for working with sessions
  async getSession(sessionId: string): Promise<any> {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await this.kv.get(sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async setSession(sessionId: string, sessionData: any): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.kv.put(sessionKey, JSON.stringify(sessionData));
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.kv.delete(sessionKey);
  }
}
