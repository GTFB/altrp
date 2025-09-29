import { Loader2Icon } from "lucide-react";

export default function SpinnerColorsDemo() {
  return (
    <div className="flex gap-4 flex-wrap">
      <Loader2Icon className="animate-spin" />
      <Loader2Icon className="animate-spin text-green-500" />
      <Loader2Icon className="animate-spin text-indigo-500" />
      <Loader2Icon className="animate-spin text-rose-500" />
    </div>
  );
}
