"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Item } from "@/types/item";

type Props = {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  chips: string[];
  featuredItems?: Item[];
};

export function HeroSection({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  chips,
  featuredItems = [],
}: Props) {
  const carouselItems = useMemo(
    () => featuredItems.filter((i) => i.imageUrl || i.imageUrl === null || i.imageUrl === undefined).slice(0, 10),
    [featuredItems]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragDelta = useRef<number>(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    if (isHovering) return;
    timeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [carouselItems.length, activeIndex, isHovering]);

  const currentItem = carouselItems[activeIndex] || null;
  const fallbackImage =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80";

  const handlePointerDown = (clientX: number) => {
    dragStartX.current = clientX;
    dragDelta.current = 0;
    isDragging.current = true;
    setIsHovering(true);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging.current || dragStartX.current === null) return;
    dragDelta.current = clientX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    const threshold = 50;
    if (dragDelta.current > threshold) {
      setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    } else if (dragDelta.current < -threshold) {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }
    dragStartX.current = null;
    dragDelta.current = 0;
    isDragging.current = false;
    setIsHovering(false);
  };

  const dragOffsetPercent =
    carouselItems.length > 0
      ? (dragDelta.current / Math.max(1, window.innerWidth || 1)) * 100
      : 0;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 lg:flex lg:items-center lg:gap-10">
      <div className="relative z-10 max-w-xl space-y-6">
        <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
          {badge}
        </div>
        <h1 className="whitespace-pre-line text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">
          {description}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700"
          >
            {primaryCta}
          </Link>
          <Link
            href="/items"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            {secondaryCta}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-white/80 px-3 py-1">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="relative mt-10 flex-1 lg:mt-0">
        <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-emerald-200/50 via-transparent to-sky-200/40 blur-3xl sm:-left-6 sm:-right-6 sm:-top-6" />
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={(e) => handlePointerDown(e.clientX)}
          onPointerMove={(e) => handlePointerMove(e.clientX)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => {
            if (isDragging.current) handlePointerUp();
          }}
        >
          <div
            className="flex h-full w-full"
            style={{
              width: `${carouselItems.length * 100}%`,
              transform: `translateX(-${
                (100 / (carouselItems.length || 1)) * activeIndex + dragOffsetPercent
              }%)`,
              transition: isDragging.current ? "none" : "transform 0.9s ease",
            }}
          >
            {(carouselItems.length ? carouselItems : [{ id: -1, imageUrl: fallbackImage, title: "Fallback", price: 0 }]).map(
              (item, idx) => (
                <Link
                  key={`${item.id}-${idx}`}
                  href={item.id === -1 ? "#" : `/items/${item.id}`}
                  className="block h-full w-full shrink-0"
                  style={{ width: `${100 / (carouselItems.length || 1)}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl && item.imageUrl.trim() !== "" ? (item.imageUrl as string) : fallbackImage}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </Link>
              )
            )}
          </div>
          {carouselItems.length > 1 && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/0" />
          )}
          {currentItem && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl bg-white/85 px-4 py-3 text-sm font-semibold text-slate-800 opacity-0 shadow transition duration-300 hover:opacity-100 lg:opacity-0 lg:hover:opacity-100">
              <p className="line-clamp-1">{currentItem.title}</p>
              <p className="text-xs text-slate-600">¥{currentItem.price.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
