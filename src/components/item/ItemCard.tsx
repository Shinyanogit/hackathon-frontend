import Link from "next/link";
import { Item } from "@/types/item";

type Props = {
  item: Item;
};

export function ItemCard({ item }: Props) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80";
  const displayImage =
    item.imageUrl && item.imageUrl.trim() !== "" ? item.imageUrl : fallbackImage;
  const brand = item.title.split(" ")[0];

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
          {brand}
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow">
          ¥{item.price.toLocaleString()}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur">
            詳細を見る
          </span>
          <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur">
            #{item.id}
          </span>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2">
            {item.description}
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          #{item.id}
        </span>
      </div>
    </Link>
  );
}
