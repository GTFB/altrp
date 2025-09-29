// Button style utilities using Tailwind classes
export const buttonStyles = {
  primary: "bg-primary text-primary-foreground border-2 border-primary shadow-[3px_3px_0px_0px] shadow-primary hover:bg-primary/90 hover:shadow-[1px_1px_0px_0px] hover:shadow-primary/60 transition-shadow duration-200 font-semibold rounded-md",
  
  outline: "bg-background text-foreground border-2 border-border shadow-[3px_3px_0px_0px] shadow-border hover:bg-accent hover:text-accent-foreground hover:shadow-[1px_1px_0px_0px] hover:shadow-border/60 transition-shadow duration-200 font-semibold rounded-md",
  
  ghost: "bg-transparent text-foreground border-2 border-border shadow-[3px_3px_0px_0px] shadow-border hover:bg-accent hover:text-accent-foreground hover:shadow-[1px_1px_0px_0px] hover:shadow-border/60 transition-shadow duration-200 font-semibold rounded-md",
  
  nav: "bg-transparent text-foreground border border-transparent shadow-none hover:bg-muted hover:text-foreground transition-colors duration-200 font-medium rounded-md",

  navSm: "bg-transparent text-foreground border border-transparent shadow-none hover:bg-muted hover:text-foreground transition-colors duration-200 font-medium rounded-md p-1 gap-0 h-6 mt-px"
} as const;

// Card style utilities
export const cardStyles = {
  info: "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
} as const;
