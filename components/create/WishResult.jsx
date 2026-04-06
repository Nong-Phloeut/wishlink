"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import RevealCard from "@/components/RevealCard";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  Copy,
  Share2,
  Plus,
  List,
  Download,
  QrCode,
  CheckCheck,
  Eye,
} from "lucide-react";

export default function WishResult({ wish, qrSrc, onReset }) {
  const t = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const wishUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/v/${wish.id}`
      : `/v/${wish.id}`;

  const copyLink = () => {
    navigator.clipboard
      .writeText(wishUrl)
      .then(() => {
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Copy failed"));
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `A wish for ${wish.recipient}`,
        url: wishUrl,
      });
    } else {
      copyLink();
    }
  };

  const downloadQR = () => {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `wish-${wish.recipient}-qr.png`;
    a.click();
    toast.success("QR downloaded!");
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
    <div className="space-y-3">
      {/* ── Success banner ── */}
      <div className="flex items-center gap-3 bg-[#F0FDF8] border border-[#A7F3D0] rounded-2xl px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
          <CheckCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#065F46]">
            {t("result.wishCreated")}
          </p>
          <p className="text-[11px] text-[#059669]">
            {t("result.shareWith", { recipient: wish.recipient })}
          </p>
        </div>
      </div>

      {/* ── Wish preview card ── */}
      <Card className="border-stone-200 shadow-sm overflow-hidden">
        <CardContent className="pt-4 pb-4">
          {!showPreview ? (
            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-[#F0FDF8]">
                🎁
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-stone-800 truncate">
                  {wish.recipient}
                </p>
                <p className="text-[12px] text-stone-400 truncate">
                  {wish.message}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-500 flex-shrink-0">
                <Eye size={13} />
                <span className="text-[12px] font-medium">{t('common.preview')}</span>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <RevealCard wish={wish} compact />
              <button
                onClick={() => setShowPreview(false)}
                className="w-full text-[12px] text-stone-400 hover:text-stone-600 transition-colors py-1"
              >
                {t('result.hidePreview')}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share options */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="pt-4 pb-4 space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            {t('common.share')}
          </p>

          <div className="flex gap-2">
            {/* Copy */}
            <button
              onClick={copyLink}
              className={[
                "flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border text-[13px] font-medium transition-all",
                copied
                  ? "border-[#1D9E75] bg-[#F0FDF8] text-[#1D9E75]"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50",
              ].join(" ")}
            >
              <Copy size={14} />
              {copied ? t('common.copied') : t('common.copy')}
            </button>

            {/* Share */}
            <button
              onClick={shareLink}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-white text-[13px] font-medium transition-colors"
            >
              <Share2 size={14} />
              {t('common.share')}
            </button>

            {/* QR */}
            <button
              onClick={() => setShowQR((q) => !q)}
              className={[
                "flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border text-[13px] font-medium transition-all",
                showQR
                  ? "border-[#1D9E75] bg-[#F0FDF8] text-[#1D9E75]"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50",
              ].join(" ")}
            >
              <QrCode size={14} />
              {showQR ? "Hide QR" : "QR"}
            </button>
          </div>

          {/* QR expanded */}
          {showQR && (
            <div className="flex flex-col items-center gap-3 pt-3 pb-1">
              <div className="relative w-40 h-40">
                <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-100 shadow-md">
                  {qrSrc && (
                    <img
                      src={qrSrc}
                      alt="QR Code"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {[
                  "-top-1.5 -left-1.5 border-t-[3px] border-l-[3px] rounded-tl-lg",
                  "-top-1.5 -right-1.5 border-t-[3px] border-r-[3px] rounded-t-lg",
                  "-bottom-1.5 -left-1.5 border-b-[3px] border-l-[3px] rounded-bl-lg",
                  "-bottom-1.5 -right-1.5 border-b-[3px] border-r-[3px] rounded-br-lg",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-5 h-5 border-[#1D9E75] ${cls}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-stone-400 text-center">
                {t("result.scanToReveal")}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={shareQR}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-white text-[12px] font-semibold transition-colors"
                >
                  <Share2 size={13} />
                  {t('common.share')} QR
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-stone-200 text-stone-600 text-[12px] font-medium hover:bg-stone-50 transition-colors"
                >
                  <Download size={13} />
                  {t('common.download')}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Bottom actions ── */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link href={`/${locale}/my-wishes`}>
          <button className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-stone-200 text-stone-700 text-[13px] font-semibold hover:bg-stone-50 transition-colors">
            <List size={15} />
            {t('common.myWishes')}
          </button>
        </Link>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-white text-[13px] font-semibold transition-colors"
        >
          <Plus size={15} />
          {t("result.createAnother")}
        </button>
      </div>
    </div>
  );
}
