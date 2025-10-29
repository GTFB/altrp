import  BaseColumn  from "@/shared/columns/BaseColumn";

export default class BaseCollection {
    created_at = new BaseColumn({ hidden: true });
    updated_at = new BaseColumn({ hidden: true });
    deleted_at = new BaseColumn({ hidden: true });
    data_in = new BaseColumn({ hidden: true, type: 'json' });
    data_out = new BaseColumn({ hidden: true, type: 'json' });
    uuid = new BaseColumn({ hidden: true });
    id = new BaseColumn({ hidden: true });
    xaid = new BaseColumn({ hidden: true });
    order = new BaseColumn({ hidden: true });
    constructor(public name: string = 'base') {}
  }