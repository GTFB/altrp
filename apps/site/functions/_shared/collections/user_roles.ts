import BaseColumn from "../columns/BaseColumn";
import BaseCollection from "./BaseCollection";

export default class UserRoles extends BaseCollection {
    __title = 'Roles';
    
    user_uuid = new BaseColumn({
        relation: {
            collection: 'users',
            valueField: 'uuid',
            labelField: 'email',
        }
    });
    
    role_uuid = new BaseColumn({
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