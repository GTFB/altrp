## Default

import { Input } from "@/components/ui/input";

export default function InputDemo() {
  return <Input type="email" placeholder="Email" className="max-w-xs" />;
}

## With ring

import { Input } from "@/components/ui/input";

export default function InputRingDemo() {
  return (
    <Input
      type="email"
      placeholder="Email"
      className="max-w-xs focus-visible:ring-[3px] focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
    />
  );
}

## Filled

import { Input } from "@/components/ui/input";

export default function FilledInputDemo() {
  return (
    <Input
      type="email"
      placeholder="Email"
      className="bg-secondary border-none shadow-none max-w-xs"
    />
  );
}

## Disabled

import { Input } from "@/components/ui/input";

export default function DisabledInputDemo() {
  return (
    <Input type="email" placeholder="Email" disabled className="max-w-xs" />
  );
}

## With label

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

## With button

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

## With adornments

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useState } from "react";

export default function InputWithAdornmentDemo() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-xs space-y-2">
      <div className="relative flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring pl-2">
        <MailIcon className="h-5 w-5 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Email"
          className="border-0 focus-visible:ring-0 shadow-none"
        />
      </div>
      <div className="relative flex items-center rounded-md border focus-within:ring-1 focus-within:ring-ring px-2">
        <LockIcon className="h-5 w-5 text-muted-foreground" />
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border-0 focus-visible:ring-0 shadow-none"
        />
        <button onClick={togglePasswordVisibility}>
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <EyeIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>
      <Button className="w-full">Log In</Button>
    </div>
  );
}

## With helper text

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputWithHelperTextDemo() {
  return (
    <div className="w-full max-w-xs space-y-1.5">
      <Label htmlFor="email-address">Email Address</Label>
      <Input id="email-address" type="email" placeholder="Email" />
      <p className="text-[0.8rem] text-muted-foreground">
        We&apos;ll never share your email with anyone else.
      </p>
    </div>
  );
}

## With error message

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputWithErrorMessageDemo() {
  return (
    <div className="w-full max-w-xs space-y-1.5">
      <Label htmlFor="email-address" className="text-destructive">
        Email Address
      </Label>
      <Input
        id="email-address"
        type="email"
        placeholder="Email"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-[0.8rem] text-destructive">This email is invalid.</p>
    </div>
  );
}

## With form

"use client";

import { InputHTMLAttributes } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormField,
  FormMessage,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type schemaType = z.infer<typeof schema>;

export default function InputWithFormDemo() {
  const form = useForm<schemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "hello@example.com",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: schemaType) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputWithForm<schemaType>
          name="email"
          title="Email"
          placeholder="Enter your email"
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

type InputWithFormProps<K> = {
  name: keyof K & string;
  title?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function InputWithForm<K>({
  title,
  name,
  className,
  ...props
}: InputWithFormProps<K>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {title && <FormLabel htmlFor={`${name}-${title}`}>{title}</FormLabel>}
          <FormControl>
            <Input
              id={`${name}-${title}`}
              {...field}
              {...props}
              className={cn(
                "aria-invalid:border-destructive aria-invalid:ring-destructive",
                className
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

## File input

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FileInputDemo() {
  return (
    <div className="w-full max-w-xs">
      <Label htmlFor="picture">Profile Picture</Label>
      <Input id="picture" type="file" className="mt-1 file:pt-0.5" />
    </div>
  );
}

## Dropzone

"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImageIcon, XCircleIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Dropzone from "react-dropzone";

const ImagePreview = ({
  url,
  onRemove,
}: {
  url: string;
  onRemove: () => void;
}) => (
  <div className="relative aspect-square">
    <button
      className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
      onClick={onRemove}
    >
      <XCircleIcon className="h-5 w-5 fill-primary text-primary-foreground" />
    </button>
    <Image
      src={url}
      height={500}
      width={500}
      alt=""
      className="border border-border h-full w-full rounded-md object-cover"
    />
  </div>
);

export default function InputDemo() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  return (
    <div className="w-full max-w-40">
      <Label htmlFor="profile">Profile Picture</Label>
      <div className="mt-1 w-full">
        {profilePicture ? (
          <ImagePreview
            url={profilePicture}
            onRemove={() => setProfilePicture(null)}
          />
        ) : (
          <Dropzone
            onDrop={(acceptedFiles) => {
              const file = acceptedFiles[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setProfilePicture(imageUrl);
              }
            }}
            accept={{
              "image/png": [".png", ".jpg", ".jpeg", ".webp"],
            }}
            maxFiles={1}
          >
            {({
              getRootProps,
              getInputProps,
              isDragActive,
              isDragAccept,
              isDragReject,
            }) => (
              <div
                {...getRootProps()}
                className={cn(
                  "border border-dashed flex items-center justify-center aspect-square rounded-md focus:outline-hidden focus:border-primary",
                  {
                    "border-primary bg-secondary": isDragActive && isDragAccept,
                    "border-destructive bg-destructive/20":
                      isDragActive && isDragReject,
                  }
                )}
              >
                <input {...getInputProps()} id="profile" />
                <ImageIcon className="h-16 w-16" strokeWidth={1.25} />
              </div>
            )}
          </Dropzone>
        )}
      </div>
    </div>
  );
}
