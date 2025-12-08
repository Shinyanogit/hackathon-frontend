"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { fetchItem } from "@/lib/api/items";

export default function ItemDetailPage() {
  const params = useParams();
  const id = params?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!id) throw new Error("missing id");
      return fetchItem(id as string);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-neutral-500">Loading item...</p>
      </div>
    );
  }

  if (isError || !data) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/"
        className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4"
      >
        ← Back to list
      </Link>
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {data.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          #{data.id} · {new Date(data.createdAt).toLocaleString()}
        </p>
        <p className="mt-4 text-base text-neutral-800">{data.description}</p>
        <div className="mt-6 inline-flex rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
          ¥{data.price.toLocaleString()}
        </div>
        {data.imageUrl ? (
          <div className="mt-6">
            <a
              href={data.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium text-neutral-700 underline"
            >
              View image
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
