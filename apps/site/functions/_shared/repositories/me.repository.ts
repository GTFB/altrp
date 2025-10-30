import type { D1Database } from '@cloudflare/workers-types'
import { eq } from 'drizzle-orm'
import type { User, Role, Human } from '../schema/types'
import { schema } from '../schema/schema'
import { createDb, type SiteDb } from './utils'

export interface UserWithRoles {
  user: User
  roles: Role[]
  human?: Human
}

export class MeRepository {
  private db: SiteDb
  private static instance: MeRepository | null = null

  private constructor(db: D1Database | null = null) {
    this.db = createDb(db)
  }

  public static getInstance(db: D1Database | null = null): MeRepository {
    if (!MeRepository.instance) {
      MeRepository.instance = new MeRepository(db)
    }
    return MeRepository.instance
  }

  /**
   * Find user by email with their roles
   */
  async findByEmailWithRoles(email: string): Promise<UserWithRoles | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)

    if (!user) {
      return null
    }

    const roles = await this.getUserRoles(user.uuid)
    const human = user.humanAid ? await this.getHuman(user.humanAid) : undefined

    return {
      user,
      roles,
      human,
    }
  }

  /**
   * Find user by ID with their roles
   */
  async findByIdWithRoles(id: number): Promise<UserWithRoles | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)

    if (!user) {
      return null
    }

    const roles = await this.getUserRoles(user.uuid)
    const human = user.humanAid ? await this.getHuman(user.humanAid) : undefined

    return {
      user,
      roles,
      human,
    }
  }

  /**
   * Find user by UUID
   */
  async findByUuid(uuid: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uuid, uuid))
      .limit(1)

    return user
  }

  /**
   * Get user's roles
   */
  private async getUserRoles(userUuid: string): Promise<Role[]> {
    // Get user role associations
    const userRoleAssociations = await this.db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userUuid, userUuid))
      .execute()

    if (!userRoleAssociations.length) {
      return []
    }

    // Get all role UUIDs
    const roleUuids = userRoleAssociations.map((ur) => ur.roleUuid)

    // Fetch all roles - we'll filter and sort in memory
    const allRoles = await this.db.select().from(schema.roles).execute()

    // Filter roles that match our UUIDs and sort by order
    const roles = allRoles
      .filter((role) => roleUuids.includes(role.uuid))
      .map((role) => {
        const association = userRoleAssociations.find((ur) => ur.roleUuid === role.uuid)
        return {
          ...role,
          userRoleOrder: association?.order || 0,
        }
      })
      .sort((a, b) => {
        // Sort by user_roles.order first, then by roles.order
        if (a.userRoleOrder !== b.userRoleOrder) {
          return a.userRoleOrder - b.userRoleOrder
        }
        const aOrder = typeof a.order === 'number' ? a.order : Number(a.order) || 0
        const bOrder = typeof b.order === 'number' ? b.order : Number(b.order) || 0
        return aOrder - bOrder
      })
      // Remove the temporary userRoleOrder field
      .map(({ userRoleOrder, ...role }) => role) as Role[]

    return roles
  }

  /**
   * Get human by haid
   */
  private async getHuman(haid: string): Promise<Human | undefined> {
    const [human] = await this.db
      .select()
      .from(schema.humans)
      .where(eq(schema.humans.haid, haid))
      .limit(1)

    return human
  }
}
