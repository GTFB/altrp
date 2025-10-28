import BaseCollection from "./BaseCollection";
import Users from "./users";
import UserRoles from "./user_roles";

const collections: Record<string, BaseCollection> = {
    base: new BaseCollection('base'),
    users: new Users(),
    user_roles: new UserRoles(),
}

export const getCollection = (collection: string): BaseCollection => {
    return collections[collection] || collections.base;
}
