import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputWithLabelDemo() {
  return (
    <div className="w-full max-w-xs">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Email" className="mt-0.5" />
    </div>
  );
}
