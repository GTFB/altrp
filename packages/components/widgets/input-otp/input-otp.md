## Default

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

## Without Separator

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  );
}

## Separated

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup className="space-x-2">
        <InputOTPSlot index={0} className="rounded-md border-l" />
        <InputOTPSlot index={1} className="rounded-md border-l" />
        <InputOTPSlot index={2} className="rounded-md border-l" />
        <InputOTPSlot index={3} className="rounded-md border-l" />
      </InputOTPGroup>
    </InputOTP>
  );
}

## Separated 2

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup className="space-x-1">
        <InputOTPSlot index={0} className="rounded-md border-l" />
        <InputOTPSlot index={1} className="rounded-md border-l" />
        <InputOTPSlot index={2} className="rounded-md border-l" />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="space-x-1">
        <InputOTPSlot index={3} className="rounded-md border-l" />
        <InputOTPSlot index={4} className="rounded-md border-l" />
        <InputOTPSlot index={5} className="rounded-md border-l" />
      </InputOTPGroup>
    </InputOTP>
  );
}

## Secondary

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup className="space-x-2">
        <InputOTPSlot
          index={0}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
        <InputOTPSlot
          index={1}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
        <InputOTPSlot
          index={2}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
        <InputOTPSlot
          index={3}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
      </InputOTPGroup>
    </InputOTP>
  );
}

## Custom Separator

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Dot } from "lucide-react";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <div role="separator" className="text-muted-foreground">
        <Dot />
      </div>
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

## Inner Shadow

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup className="space-x-2">
        <InputOTPSlot
          index={0}
          className="rounded-md border-l border-accent/90 shadow-inner dark:shadow-primary/10"
        />
        <InputOTPSlot
          index={1}
          className="rounded-md border-l border-accent/90 shadow-inner dark:shadow-primary/10"
        />
        <InputOTPSlot
          index={2}
          className="rounded-md border-l border-accent/90 shadow-inner dark:shadow-primary/10"
        />
        <InputOTPSlot
          index={3}
          className="rounded-md border-l border-accent/90 shadow-inner dark:shadow-primary/10"
        />
      </InputOTPGroup>
    </InputOTP>
  );
}
