
// Block types
export interface Block {
    id: string;
    type: string;
    label: string;
    content: string;
    componentName: string;
    importString: string;
    order: number;
  }
  
  export interface AvailableBlock {
    type: string;
    label: string;
    componentName: string;
    importString: string;
    group?: string;
  }