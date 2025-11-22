import type { D1Database } from '@cloudflare/workers-types'
import { eq } from 'drizzle-orm'
import type { User, Role, Human, Employee, Location } from '../schema/types'
import { schema } from '../schema/schema'
import { createDb, notDeleted, withNotDeleted, type SiteDb } from './utils'

export interface UserWithRoles extends User {
  user: User
  roles: Role[]
  human?: Human
  employee?: Employee
  location?: Location
}

export class MeRepository {
  private db: SiteDb
  private static instance: MeRepository | null = null

  private constructor(db: D1Database) {
    this.db = createDb(db)
  }

  public static getInstance(db: D1Database): MeRepository {
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

    if (!user || user.deletedAt) {
      return null
    }

    const roles = await this.getUserRoles(user.uuid)
    const human = user.humanAid ? await this.getHuman(user.humanAid) : undefined

    return {
      ...user,
      user,
      roles,
      human,
    }
  }

  /**
   * Find user by ID with their roles
   */
  async findByIdWithRoles(id: number, options?: { includeHuman?: boolean, includeEmployee?: boolean, includeLocation?: boolean }): Promise<UserWithRoles | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)

    if (!user || user.deletedAt) {
      return null
    }

    const roles = await this.getUserRoles(user.uuid)
    const human = user.humanAid && options?.includeHuman !== false ? await this.getHuman(user.humanAid) : undefined
    const employee = user.humanAid && options?.includeEmployee !== false ? await this.getEmployeeByHumanAid(user.humanAid) : undefined
    
    // Get location from employee's dataIn.location_laid if available
    let location: Location | undefined = undefined
    if (employee && options?.includeLocation !== false) {
      try {
        const dataIn = employee.dataIn as { location_laid: string }
        if (dataIn?.location_laid as string) {
          location = await this.getLocation(dataIn.location_laid as string)
        }
      } catch (err) {
        console.error('Failed to parse employee dataIn or fetch location:', err)
      }
    }
    
    return {
      ...user,
      user,
      roles,
      human,
      employee,
      location,
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

    if (user?.deletedAt) {
      return undefined
    }

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

    // Fetch all roles (excluding soft-deleted) - we'll filter and sort in memory
    const allRoles = await this.db
      .select()
      .from(schema.roles)
      .where(notDeleted(schema.roles.deletedAt))
      .execute()

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
      .where(withNotDeleted(
        schema.humans.deletedAt,
        eq(schema.humans.haid, haid)
      ))
      .limit(1)

    return human
  }

  /**
   * Get employee by eaid
   */
  private async getEmployee(eaid: string): Promise<Employee | undefined> {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(withNotDeleted(
        schema.employees.deletedAt,
        eq(schema.employees.eaid, eaid)
      ))
      .limit(1)

    return employee
  }

  /**
   * Find employee by eaid (public method)
   */
  async findEmployeeByEaid(eaid: string): Promise<Employee | undefined> {
    return this.getEmployee(eaid)
  }

  /**
   * Get employee by humanAid (using haid field in employees table)
   */
  private async getEmployeeByHumanAid(humanAid: string): Promise<Employee | undefined> {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(withNotDeleted(
        schema.employees.deletedAt,
        eq(schema.employees.haid, humanAid)
      ))
      .limit(1)

    return employee
  }

  /**
   * Get location by laid
   */
  private async getLocation(laid: string): Promise<Location | undefined> {
    const [location] = await this.db
      .select()
      .from(schema.locations)
      .where(withNotDeleted(
        schema.locations.deletedAt,
        eq(schema.locations.laid, laid)
      ))
      .limit(1)

    return location
  }
}
