import { Button } from "@/components/ui/button";

const ButtonLinkDemo = () => (
  <div className="flex items-center gap-2 flex-wrap">
    <Button variant="link">Link</Button>
    <Button variant="link" disabled>
      Disabled Link
    </Button>
  </div>
);

export default ButtonLinkDemo;
