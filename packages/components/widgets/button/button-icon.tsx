import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const ButtonIconDemo = () => {
  return (
    <div className="flex items-center gap-2">
      <Button size="icon">
        <Star />
      </Button>
      <Button>
        <Star /> Star
      </Button>
      <Button>
        Read More <ArrowRight />
      </Button>
    </div>
  );
};

export default ButtonIconDemo;
