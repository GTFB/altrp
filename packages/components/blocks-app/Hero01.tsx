"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Link from "next/link";
import React from "react";

const Hero01 = () => {
  const [open, setOpen] = React.useState(false);
  const [projectType, setProjectType] = React.useState("website");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const body = { name, email, projectType, description };

      const resp = await fetch("/api/request-send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const details = await resp.json().catch(() => ({})) as { error?: string };
        throw new Error(details?.error || "Failed to send request");
      }
      form.reset();
      setProjectType("website");
      setOpen(false);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-[calc(100vh-70px)] flex items-center justify-center px-6">
      <div className="text-center max-w-3xl">
        <Badge
          variant="secondary"
          className="rounded-full py-1 border-border"
        >
          <Link href="#" className="flex items-center gap-1">
            <span>ALTRP Platform v4.0.0</span>
            <ArrowUpRight className="size-4 flex-shrink-0" />
          </Link>
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.2] font-semibold tracking-tighter">
          Create digital products without code
        </h1>
        <p className="mt-6 md:text-lg">
          Powerful platform for rapid generation of web applications, mobile apps and digital solutions
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full text-base">
                Start Creating <ArrowUpRight className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a project</DialogTitle>
                <DialogDescription>
                  Tell us a bit about your website or landing. We will contact you shortly.
                </DialogDescription>
              </DialogHeader>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="projectType">Project type</Label>
                  <input type="hidden" name="projectType" value={projectType} />
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="projectType" className="w-full">
                      <SelectValue placeholder="Choose type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="landing">Landing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Project description</Label>
                  <Textarea id="description" name="description" placeholder="Goals, scope, deadline, budget..." rows={4} />
                </div>
                {errorMessage ? (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                ) : null}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full text-base shadow-none bg-black text-white"
          >
            <CirclePlay className="size-5" /> Watch Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero01;
