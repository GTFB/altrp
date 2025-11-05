import BaseColumn from "../columns/BaseColumn";
import BaseCollection from "./BaseCollection";

export default class UserRoles extends BaseCollection {
    __title = 'Users Roles';
    
    user_uuid = new BaseColumn({
        title: 'User',
        relation: {
            collection: 'users',
            valueField: 'uuid',
            labelField: 'email',
        }
    });
    
    role_uuid = new BaseColumn({
        title: 'Role',
        relation: {
            collection: 'roles',
            valueField: 'uuid',
            labelField: 'name',
        }
    });
    
    constructor() {
        super('user_roles');
    }
}