import { Loader2Icon } from "lucide-react";

export default function SpinnerSizesDemo() {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      <Loader2Icon className="animate-spin h-4 w-4" />
      <Loader2Icon className="animate-spin h-5 w-5" />
      <Loader2Icon className="animate-spin h-6 w-6" />
      <Loader2Icon className="animate-spin h-8 w-8" />
    </div>
  );
}
