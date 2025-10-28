import BaseColumn from "../columns/BaseColumn";
import BaseCollection from "./BaseCollection";

export default class Humans extends BaseCollection {
    __title = 'Humans';
    
    full_name = new BaseColumn({
        title: 'Full Name',
    });
    
    'data_in.phone' = new BaseColumn({
        title: 'Phone',
        type: 'phone',
        virtual: true,
        defaultCell: 'Not Provided',
        value: async (instance: any) => {
            // Parse data_in if it's a string
            if (typeof instance.data_in === 'string') {
                try {
                    const parsed = JSON.parse(instance.data_in)
                    return parsed?.phone || ''
                } catch {
                    return ''
                }
            }
            return instance.data_in?.phone || ''
        },
        hooks: {
            beforeSave: (value: any, instance: any) => {
                if (!instance.data_in ) {
                    instance.data_in = {};
                }
                instance.data_in.phone = value
                return instance.data_in
            }
        }
    });
    
    constructor() {
        super('humans');
    }
}