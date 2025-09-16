import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const ButtonLoadingDemo = () => {
  return (
    <div className="flex items-center gap-2">
      <Button size="icon">
        <Loader className="animate-spin" />
      </Button>
      <Button>
        <Loader className="animate-spin" /> Loading
      </Button>
    </div>
  );
};

export default ButtonLoadingDemo;
