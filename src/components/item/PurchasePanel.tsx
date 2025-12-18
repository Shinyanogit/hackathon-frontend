"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/apiClient";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  cancelPurchase,
  markDelivered,
  markShipped,
  purchaseItem,
} from "@/lib/api/purchases";
import { Purchase, PurchaseStatus } from "@/types/purchase";

type Props = {
  itemId: number;
  price: number;
  treeYears?: number | null;
  treePoints?: number | null;
  sellerUid?: string;
  purchase: Purchase | null;
  onChanged?: () => void;
  itemStatus?: "listed" | "paused" | "in_transaction" | "sold" | string;
};

const statusMeta: Record<
  PurchaseStatus,
  { label: string; color: string; bg: string; description: string }
> = {
  pending_shipment: {
    label: "発送待ち",
    color: "text-amber-700",
    bg: "bg-amber-50",
    description: "購入済み。出品者が発送手続きを完了すると通知されます。",
  },
  shipped: {
    label: "発送済み",
    color: "text-blue-700",
    bg: "bg-blue-50",
    description: "発送完了。到着したら受け取り報告をしてください。",
  },
  delivered: {
    label: "受取完了",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    description: "取引が完了しました。",
  },
  canceled: {
    label: "キャンセル済み",
    color: "text-slate-700",
    bg: "bg-slate-100",
    description: "購入者がキャンセルしました。",
  },
};

function StatusBadge({ status }: { status: PurchaseStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

export function PurchasePanel({
  itemId,
  price,
  treeYears,
  treePoints,
  sellerUid,
  purchase,
  onChanged,
  itemStatus,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState<string>("");
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const prevStatus = useRef<PurchaseStatus | null>(purchase?.status ?? null);

  const parsedPoints = useMemo(() => {
    const num = Number(pointsInput);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.min(price, Math.floor(num)));
  }, [pointsInput, price]);
  const payable = Math.max(0, price - parsedPoints);
  const pointsUsed = purchase?.pointsUsed ?? parsedPoints;
  const paidYen = purchase
    ? Math.max(0, purchase.paidYen ?? price - (purchase.pointsUsed ?? 0))
    : payable;

  const isCanceled = purchase?.status === "canceled";
  const isSeller = !!user && sellerUid === user.uid;
  const isBuyer = !!user && purchase?.buyerUid === user.uid;
  const sold = itemStatus === "sold" || itemStatus === "in_transaction" || (!!purchase && !isCanceled);
  const canPurchase = !!user && !sold && !isSeller;

  const purchaseMutation = useMutation({
    mutationFn: () =>
      purchaseItem(itemId, pointsInput !== "" ? parsedPoints : undefined),
    onSuccess: () => {
      setError(null);
      const tYears = treeYears ?? null;
      const treesText = tYears != null ? `${tYears.toFixed(1)} 本` : "";
      setToast(
        treesText
          ? `取引成立！このリユースで約 ${treesText} の木が1年で吸収するCO2相当を節約できます！`
          : "取引成立！リユースで資源が節約できます。"
      );
      setPointsInput("");
      onChanged?.();
      queryClient.invalidateQueries({ queryKey: ["thread", itemId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.uid] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("この商品はすでに購入済みです。");
          return;
        }
        if (err.status === 400 && err.message?.includes("insufficient points")) {
          setError("ポイント残高が不足しています。使用ポイントを減らすか、ポイント付与をお待ちください。");
          return;
        }
      }
      const msg = err instanceof Error ? err.message : "購入に失敗しました";
      setError(msg);
    },
  });

  useEffect(() => {
    const current = purchase?.status ?? null;
    // 取引成立（初回購入）
    if (prevStatus.current === null && current === "pending_shipment") {
      const treesText = treeYears != null ? `${treeYears.toFixed(1)} 本` : "";
      setToast(
        treesText
          ? `取引成立！このリユースで約 ${treesText} の木が1年で吸収するCO2相当を節約できます！`
          : "取引成立！リユースで資源が節約できます。"
      );
    }
    // 取引完了（受取完了）
    if (prevStatus.current !== "delivered" && current === "delivered") {
      const treesText = treeYears != null ? `${treeYears.toFixed(1)} 本` : "";
      const pts = treePoints != null ? `+${treePoints.toFixed(1)}pt` : "";
      setToast(
        treesText
          ? `購入完了！約 ${treesText} の木相当の資源を節約できました！ ${pts}`
          : `購入完了！資源を節約できました！ ${pts}`
      );
      setCelebrate(null);
    }
    prevStatus.current = current;
  }, [purchase?.status, treePoints, treeYears]);

  const shipMutation = useMutation({
    mutationFn: (purchaseId: number) => markShipped(purchaseId),
    onSuccess: () => {
      setError(null);
      onChanged?.();
      queryClient.invalidateQueries({ queryKey: ["thread", itemId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "発送状態の更新に失敗しました";
      setError(msg);
    },
  });

  const deliveredMutation = useMutation({
    mutationFn: (purchaseId: number) => markDelivered(purchaseId),
    onSuccess: () => {
      setError(null);
      onChanged?.();
      queryClient.invalidateQueries({ queryKey: ["thread", itemId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "受け取り報告に失敗しました";
      setError(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (purchaseId: number) => cancelPurchase(purchaseId),
    onSuccess: () => {
      setError(null);
      onChanged?.();
      queryClient.invalidateQueries({ queryKey: ["thread", itemId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.uid] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "キャンセルに失敗しました";
      setError(msg);
    },
  });

  const canShip = purchase?.status === "pending_shipment" && isSeller;
  const canConfirmReceive = purchase?.status === "shipped" && isBuyer;
  const canCancel = purchase?.status === "pending_shipment" && isBuyer;

  const headline = useMemo(() => {
    if (!user) return sold ? "販売済み" : "購入手続き";
    if (isSeller) return sold ? "購入者との取引" : "購入待ち";
    if (sold && !isBuyer) return "販売済み";
    return "購入手続き";
  }, [user, isSeller, sold, isBuyer]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {toast && (
        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
          {toast}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Purchase
          </p>
          <h3 className="text-lg font-bold text-slate-900">{headline}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-slate-900">¥{price.toLocaleString()}</p>
            {treePoints != null && treePoints > 0 && (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                <span>
                  木 {treeYears != null ? treeYears.toFixed(1) : "—"} 年 / +{treePoints} pt
                </span>
                <InfoTooltip treeYearsText={treeYears != null ? treeYears.toFixed(1) : undefined} />
              </div>
            )}
            {purchase && isBuyer && (
              <div className="text-[11px] font-semibold text-slate-700">
                支払額 ¥{paidYen.toLocaleString()}
                {pointsUsed > 0 && <>（ポイント使用 {pointsUsed.toLocaleString()} pt）</>}
              </div>
            )}
          </div>
          {canPurchase && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={price}
                  step={1}
                  value={pointsInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setPointsInput("");
                      return;
                    }
                    const num = Math.max(0, Math.min(price, Math.floor(Number(val))));
                    setPointsInput(String(num));
                  }}
                  placeholder="使うpt"
                  className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200"
                />
                <span className="text-[11px] text-slate-500">ポイント利用（任意）</span>
              </div>
              {parsedPoints > 0 && (
                <div className="text-right text-[11px] font-semibold text-emerald-700">
                  ポイント使用: {parsedPoints} pt → 支払額 ¥{payable.toLocaleString()}
                </div>
              )}
              <button
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? "処理中..." : "購入する"}
              </button>
            </div>
          )}
          {!purchase && sold && (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              売り切れ
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3 text-sm text-slate-700">
        {!user && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="font-semibold text-slate-900">ログインして購入を進める</p>
            <p className="text-xs text-slate-600">
              購入・DMにはログインが必要です。上部のログインボタンからサインインしてください。
            </p>
          </div>
        )}

        {user && isSeller && !sold && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">まだ購入はありません</p>
            <p className="text-xs text-slate-600">
              購入が入ると発送用のQRコードとDMが自動で立ち上がります。
            </p>
          </div>
        )}

        {user && purchase && !isCanceled && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            {celebrate && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                {celebrate}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {statusMeta[purchase.status].label}
                </p>
                <p className="text-xs text-slate-600">{statusMeta[purchase.status].description}</p>
              </div>
            </div>
            {purchase.status === "pending_shipment" && (
              <>
                {isSeller ? (
                  <div className="rounded-lg border border-dashed border-amber-200 bg-white px-4 py-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">発送手順</p>
                    <p className="mt-1 text-slate-600">{purchase.shippingNote}</p>
                    <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={purchase.shippingQrUrl}
                        alt="Shipping QR"
                        className="h-28 w-28 rounded-lg border border-slate-200 bg-white object-contain p-2"
                      />
                      <div className="text-[11px] text-slate-500">
                        コンビニで店員に提示してください。発送後に「発送済みにする」を押すと購入者へ通知されます。
                      </div>
                    </div>
                    {canShip && (
                      <button
                        className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        onClick={() => shipMutation.mutate(purchase.id)}
                        disabled={shipMutation.isPending}
                      >
                        {shipMutation.isPending ? "更新中..." : "発送済みにする"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">発送待ち</p>
                    <p className="mt-1 text-slate-600">
                      出品者が発送を準備中です。DMで発送予定を相談できます。
                    </p>
                    {canCancel && (
                      <button
                        className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-400"
                        onClick={() => cancelMutation.mutate(purchase.id)}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? "キャンセル中..." : "購入をキャンセルする"}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {purchase.status === "shipped" && (
              canConfirmReceive && (
                <button
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  onClick={() => deliveredMutation.mutate(purchase.id)}
                  disabled={deliveredMutation.isPending}
                >
                  {deliveredMutation.isPending ? "送信中..." : "受け取りを報告"}
                </button>
              )
            )}

            {purchase.status === "canceled" && (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">キャンセル済み</p>
                <p className="mt-1 text-slate-600">この取引はキャンセルされました。</p>
              </div>
            )}

            {isSeller && (
              <p className="text-[11px] text-slate-500">購入者UID: {purchase.buyerUid}</p>
            )}
          </div>
        )}

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        {isCanceled && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">キャンセル済み</p>
            <p className="mt-1 text-slate-600">この取引はキャンセルされています。再度購入できます。</p>
          </div>
        )}
      </div>
    </div>
  );
}
