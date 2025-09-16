import { Button } from "@/components/ui/button";
import { Instagram, Twitch, Twitter } from "lucide-react";
import React from "react";

const ButtonSocialDemo = () => {
  return (
    <div className="flex items-center gap-2">
      <Button size="icon" className="rounded-full">
        <Twitch />
      </Button>
      <Button size="icon" className="rounded-full">
        <Instagram />
      </Button>
      <Button size="icon" className="rounded-full">
        <Twitter />
      </Button>
    </div>
  );
};

export default ButtonSocialDemo;
