import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InputWithButtonDemo() {
  return (
    <div className="w-full max-w-xs flex items-center gap-2">
      <Input type="email" placeholder="Email" />
      <Button className="shadow">Subscribe</Button>
    </div>
  );
}
