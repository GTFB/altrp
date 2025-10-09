"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  postFormSchema,
  type PostFormData,
} from "@/lib/validators/form.schema";
import { TipTapEditor } from "@/components/blocks-app/cms/TipTapEditor";

export function PostForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
  });

  const onSubmit = (data: PostFormData) => {
    console.log("Form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          {...register("title")}
          className="w-full px-3 py-2 border rounded-md bg-background"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          {...register("description")}
          className="w-full px-3 py-2 border rounded-md bg-background"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          {...register("date")}
          type="date"
          className="w-full px-3 py-2 border rounded-md bg-background"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <TipTapEditor onChange={(content) => setValue("content", content)} />
        {errors.content && (
          <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Save Post
      </button>
    </form>
  );
}
