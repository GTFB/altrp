import { Button } from "@/components/ui/button";

const GroupButtonDemo = () => (
  <div className="flex items-center gap-2 flex-wrap">
    <div className="divide-x divide-muted-foreground">
      <Button className="rounded-none first:rounded-l-md last:rounded-r-md">
        Left
      </Button>
      <Button className="rounded-none first:rounded-l-md last:rounded-r-md">
        Middle
      </Button>
      <Button className="rounded-none first:rounded-l-md last:rounded-r-md">
        Right
      </Button>
    </div>
  </div>
);

export default GroupButtonDemo;
