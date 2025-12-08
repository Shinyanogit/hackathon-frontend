"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { fetchItems } from "@/lib/api/items";
import { Item } from "@/types/item";
import { ItemCard } from "@/components/item/ItemCard";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type ItemForm = z.infer<typeof itemSchema>;

export default function Home() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      imageUrl: "",
    },
  });

  const createItem = useMutation({
    mutationFn: async (payload: ItemForm) => {
      const res = await apiClient.post<Item>("/items", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      reset();
    },
  });

  const onSubmit = handleSubmit((values) => {
    createItem.mutate(values);
  });

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 px-4 py-8 sm:px-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Next-gen Flea Market
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl">
          List an item and see it live. Thin vertical slice to verify the stack.
        </h1>
        <p className="text-neutral-600 sm:max-w-3xl">
          This page writes and reads against the backend API. Update{" "}
          <code className="rounded bg-neutral-900/5 px-2 py-1 text-sm">
            NEXT_PUBLIC_API_BASE_URL
          </code>{" "}
          to point to Cloud Run when deployed.
        </p>
      </header>

      <main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Sell an item
              </h2>
              <p className="text-sm text-neutral-500">
                Minimal fields to prove create → list → detail.
              </p>
            </div>
            {createItem.isLoading ? (
              <span className="text-xs text-neutral-500">Saving...</span>
            ) : null}
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">
                Title
              </label>
              <input
                {...register("title")}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none"
                placeholder="Vintage camera"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none"
                rows={3}
                placeholder="Condition, story, etc."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-800">
                  Price (JPY)
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("price")}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-800">
                  Image URL (optional)
                </label>
                <input
                  {...register("imageUrl")}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-800 focus:outline-none"
                  placeholder="https://..."
                />
                {errors.imageUrl && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 sm:w-auto"
              disabled={createItem.isLoading}
            >
              {createItem.isLoading ? "Creating..." : "Create item"}
            </button>
            {createItem.isError ? (
              <p className="text-sm text-red-600">
                Failed to create item. Check API base URL and inputs.
              </p>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              Latest items
            </h2>
            <span className="text-xs text-neutral-500">
              {data?.total ?? 0} items
            </span>
          </div>
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
            {isError && (
              <p className="text-sm text-red-600">
                Failed to load items. Ensure backend is running.
              </p>
            )}
            {!isLoading && data?.items.length === 0 && (
              <p className="text-sm text-neutral-500">No items yet.</p>
            )}
            {data?.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
