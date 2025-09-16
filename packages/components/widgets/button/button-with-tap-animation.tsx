import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";

const ButtonWithTapAnimationDemo = () => (
  <div className="flex items-center gap-2 flex-wrap">
    <Button className="active:scale-95 transition-transform duration-75">
      Tap
    </Button>
    <Button size="icon" className="active:scale-95 transition-transform duration-75">
      <StarIcon />
    </Button>
    <Button className="active:scale-95 transition-transform duration-75">
      <StarIcon /> Star
    </Button>
  </div>
);

export default ButtonWithTapAnimationDemo;
