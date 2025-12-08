import Link from "next/link";
import { Item } from "@/types/item";

type Props = {
  item: Item;
};

export function ItemCard({ item }: Props) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="block rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            {item.title}
          </h3>
          <p className="text-xs text-neutral-500">
            #{item.id} · {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="text-sm font-semibold text-neutral-800">
          ¥{item.price.toLocaleString()}
        </span>
      </div>
      <p className="mt-2 text-sm text-neutral-700">{item.description}</p>
      {item.imageUrl ? (
        <p className="mt-2 text-xs font-medium text-neutral-700 underline">
          Image attached
        </p>
      ) : null}
    </Link>
  );
}
