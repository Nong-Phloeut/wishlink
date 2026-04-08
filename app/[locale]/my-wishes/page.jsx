"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getOccasion } from "@/lib/occasions";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Share2,
  Copy,
  Eye,
  Trash2,
  Gift,
  WifiOff,
  CheckCheck,
  QrCode,
  Download,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";

// QR panel shown inside a wish card
function WishQRPanel({ wish, onClose }) {
  const [qrSrc, setQrSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wishUrl = `${window.location.origin}/v/${wish.id}`;
    fetch(`/api/qr?url=${encodeURIComponent(wishUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        setQrSrc(d.dataUrl);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wish.id]);

  const downloadQR = () => {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `wish-${wish.recipient}-qr.png`;
    a.click();
  };

  const shareQR = async () => {
    if (!qrSrc) return;
    try {
      const blob = await (await fetch(qrSrc)).blob();
      const file = new File([blob], `wish-${wish.recipient}-qr.png`, {
        type: "image/png",
      });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `QR wish for ${wish.recipient}`,
        });
      } else {
        downloadQR();
      }
    } catch {
      downloadQR();
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-stone-100">
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-stone-300" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-36 h-36">
            <div className="w-full h-full rounded-xl overflow-hidden border border-stone-100 shadow-md">
              {qrSrc && (
                <img
                  src={qrSrc}
                  alt="QR"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {[
              "-top-1 -left-1 border-t-2 border-l-2 rounded-tl",
              "-top-1 -right-1 border-t-2 border-r-2 rounded-tr",
              "-bottom-1 -left-1 border-b-2 border-l-2 rounded-bl",
              "-bottom-1 -right-1 border-b-2 border-r-2 rounded-br",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 border-[#1D9E75] ${cls}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-stone-400">
            Scan with any camera to reveal
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={shareQR}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-white text-[12px] font-semibold transition-colors"
            >
              <Share2 size={12} /> Share QR
            </button>
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-stone-200 text-stone-600 text-[12px] font-medium hover:bg-stone-50 transition-colors"
            >
              <Download size={12} /> Download
            </button>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={11} /> Hide QR
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyWishesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [wishes, setWishes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(null);
  const [deleted, setDeleted] = useState(null);
  const [openQR, setOpenQR] = useState(null); // wish.id with QR open

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("my_wishes") || "[]");
    setWishes(stored);
    setLoaded(true);
  }, []);

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/v/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareLink = async (wish) => {
    const url = `${window.location.origin}/v/${wish.id}`;
    if (navigator.share)
      await navigator.share({ title: `A wish for ${wish.recipient}`, url });
    else copyLink(wish.id);
  };

  const deleteWish = (id) => {
    setDeleted(id);
    setTimeout(() => {
      const updated = wishes.filter((w) => w.id !== id);
      setWishes(updated);
      localStorage.setItem("my_wishes", JSON.stringify(updated));
      setDeleted(null);
    }, 300);
  };

  const toggleQR = (id) => setOpenQR(openQR === id ? null : id);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const subtitle =
    loaded && wishes.length > 0
      ? wishes.length === 1
        ? t("myWishes.subtitle", { count: 1 })
        : t("myWishes.subtitle_plural", { count: wishes.length })
      : t("myWishes.savedOnDevice");

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[430px] mx-auto px-4 pb-36">
        {/* Header */}
        <div className="pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-stone-900">
                {t("myWishes.title").split(" ")[0]}{" "}
                <span className="text-[#1D9E75]">
                  {t("myWishes.title").split(" ").slice(1).join(" ")}
                </span>
              </h1>
              <p className="text-[11px] text-stone-400 mt-0.5">{subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center">
              <Gift size={18} className="text-[#1D9E75]" />
            </div>
          </div>
        </div>

        {/* Skeleton */}
        {!loaded && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-stone-200/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {loaded && wishes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-[#1D9E75]/10 flex items-center justify-center mb-5">
              <Gift size={36} className="text-[#1D9E75]" />
            </div>
            <h2 className="text-[17px] font-bold text-stone-700 mb-2">
              {t("myWishes.empty")}
            </h2>
            <p className="text-[13px] text-stone-400 mb-7 leading-relaxed max-w-[260px]">
              {t("myWishes.emptyDesc")}
            </p>
            <Link href={`/${locale}`}>
              <Button
                type="button"
                className="group w-full h-12 rounded-2xl text-[15px] font-bold bg-[#1D9E75] hover:bg-[#178060] shadow-lg shadow-[#1D9E75]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {t("myWishes.createFirst")}
                <ChevronRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </div>
        )}

        {/* List */}
        {loaded && wishes.length > 0 && (
          <div className="space-y-3">
            {/* Device warning */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <WifiOff
                size={14}
                className="text-amber-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                {t("myWishes.deviceWarning")}
              </p>
            </div>

            {wishes.map((wish) => {
              const occ = getOccasion(wish.occasion);
              const isDeleting = deleted === wish.id;
              const isQROpen = openQR === wish.id;

              return (
                <div
                  key={wish.id}
                  className="transition-all duration-300"
                  style={{
                    opacity: isDeleting ? 0 : 1,
                    transform: isDeleting
                      ? "scale(0.97) translateY(-4px)"
                      : "scale(1)",
                  }}
                >
                  <div
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                    style={{ borderLeft: `3px solid ${occ.accent}` }}
                  >
                    <div className="p-4">
                      {/* Top row */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                          style={{ background: occ.bg }}
                        >
                          {occ.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-[14px] font-bold text-stone-800 truncate">
                              {wish.recipient}
                            </p>
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: occ.bg, color: occ.accent }}
                            >
                              {occ.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-stone-400 truncate leading-snug">
                            {wish.message}
                          </p>
                          <p className="text-[10px] text-stone-300 mt-1">
                            {formatDate(wish.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteWish(wish.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 -mt-0.5"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="h-px bg-stone-100 my-3" />

                      {/* Action row */}
                      <div className="flex gap-2">
                        <Link href={`/v/${wish.id}`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-stone-200 text-stone-500 text-[12px] font-medium hover:bg-stone-50 transition-colors">
                            <Eye size={12} />
                            {t("common.view")}
                          </button>
                        </Link>

                        <button
                          onClick={() => copyLink(wish.id)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border text-[12px] font-medium transition-all",
                            copied === wish.id
                              ? "border-[#1D9E75]/30 text-[#1D9E75] bg-[#F0FDF8]"
                              : "border-stone-200 text-stone-500 hover:bg-stone-50",
                          )}
                        >
                          {copied === wish.id ? (
                            <>
                              <CheckCheck size={12} />
                              {t("common.copied")}
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              {t("common.copy")}
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => shareLink(wish)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#1D9E75] hover:bg-[#178060] text-white text-[12px] font-medium transition-colors"
                        >
                          <Share2 size={12} />
                          {t("common.share")}
                        </button>

                        {/* QR toggle button */}
                        <button
                          onClick={() => toggleQR(wish.id)}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-lg border text-[12px] transition-all",
                            isQROpen
                              ? "border-[#1D9E75]/30 text-[#1D9E75] bg-[#F0FDF8]"
                              : "border-stone-200 text-stone-500 hover:bg-stone-50",
                          )}
                        >
                          <QrCode size={13} />
                        </button>
                      </div>

                      {/* QR Panel */}
                      {isQROpen && (
                        <WishQRPanel
                          wish={wish}
                          onClose={() => setOpenQR(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sign in CTA */}
            {/* <div className="border border-dashed border-stone-200 rounded-2xl p-5 flex flex-col items-center text-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center">
                <GoogleIcon size={16} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-stone-700 mb-0.5">{t("myWishes.signInToSync")}</p>
                <p className="text-[11px] text-stone-400">Access your wishes from any device</p>
              </div>
              <button
                className="flex items-center gap-2 h-10 px-5 rounded-xl border border-stone-200 text-stone-700 text-[13px] font-medium hover:bg-stone-50 transition-colors"
                onClick={async () => {
                  const { supabase } = await import("@/lib/supabase");
                  supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: `${window.location.origin}/auth/callback?next=/my-wishes` },
                  });
                }}
              >
                <GoogleIcon size={14} />
                {t("myWishes.continueGoogle")}
              </button>
            </div> */}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
