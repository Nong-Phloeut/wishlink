"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from 'lucide-react' // or ArrowLeft
import {
  Lock,
  Sparkles,
  Video,
  ImageIcon,
  CheckCircle2,
  Tag,
  X,
  Plus,
  Play,
} from "lucide-react";
// import UpgradeModal from "@/components/UpgradeModal";
import CouponModal from "@/components/CouponModal";

export default function MediaStep({
  imageFiles,
  imagePreviews,
  onImagesChange,
  onRemoveImage,
  videoFile,
  videoPreview,
  onVideoChange,
  onRemoveVideo,
  loading,
  uploadProgress,
  onBack,
  wishId,
}) {
  const t = useTranslations("create");
  const tc = useTranslations("common");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window === "undefined") return false;
    const list = JSON.parse(localStorage.getItem("premium_wishes") || "[]");
    return wishId ? list.includes(wishId) : false;
  });

  const handleUpgraded = () => {
    setIsPremium(true);
    setShowUpgrade(false);
    if (wishId) {
      const list = JSON.parse(localStorage.getItem("premium_wishes") || "[]");
      if (!list.includes(wishId)) {
        list.push(wishId);
        localStorage.setItem("premium_wishes", JSON.stringify(list));
      }
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError(t("couponEmpty"));
      return;
    }

    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const text = await res.text();
      console.log("status:", res.status, "body:", text.slice(0, 200));

      // HTML response = route not found or server crash
      if (text.startsWith("<") || text.startsWith("<!")) {
        setCouponError(`Route error (${res.status}) — check terminal logs`);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setCouponError("Invalid response from server");
        return;
      }

      if (!res.ok) {
        setCouponError(data.error);
        return;
      }
      setCouponSuccess(true);
      setTimeout(() => handleUpgraded(), 800);
    } catch (err) {
      console.error("coupon error:", err);
      setCouponError(tc("error"));
    } finally {
      setCouponLoading(false);
    }
  };
  return (
    <div className="space-y-3">
      {/* ── Upsell banner ── */}
      {!isPremium && (
        <div className="rounded-2xl overflow-hidden border border-amber-200 bg-amber-50">
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="w-full p-4 text-left hover:bg-amber-100/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm">
                  <Sparkles size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-amber-900">
                    {t("upgradeTitle")}
                  </p>
                  <p className="text-[10px] text-amber-600">
                    {t("upgradeSubtitle")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-extrabold text-amber-600 leading-none">
                  $1
                </div>
                <div className="text-[10px] text-amber-500">
                  {t("upgradeOneTime")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {[
                { icon: ImageIcon, key: "featurePhotos" },
                { icon: Video, key: "featureVideo" },
                { icon: Sparkles, key: "featureQR" },
                { icon: CheckCircle2, key: "featureSlideshow" },
              ].map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5"
                >
                  <Icon size={12} className="text-amber-500 flex-shrink-0" />
                  <span className="text-[11px] text-amber-800 font-medium">
                    {t(key)}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full bg-amber-400 text-white rounded-xl py-2.5 text-[13px] font-bold text-center">
              {t("upgradeCta")}
            </div>
          </button>

          {/* Coupon */}
          <div className="border-t border-amber-200 px-4 py-3">
            {!showCoupon ? (
              <button
                type="button"
                onClick={() => setShowCoupon(true)}
                className="flex items-center gap-1.5 text-[11px] text-amber-600 hover:text-amber-800 transition-colors"
              >
                <Tag size={12} />
                {t("haveCoupon")}
              </button>
            ) : couponSuccess ? (
              <div className="flex items-center gap-2 text-[#1D9E75]">
                <CheckCircle2 size={14} />
                <span className="text-[12px] font-semibold">
                  {t("couponApplied")}
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder={t("couponPlaceholder")}
                    className={[
                      "flex-1 h-9 px-3 rounded-lg border outline-none transition-colors bg-white",
                      couponError
                        ? "border-red-300 focus:border-red-400"
                        : "border-amber-200 focus:border-amber-400",
                    ].join(" ")}
                    style={{ fontSize: 16 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="h-9 px-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white rounded-lg text-[12px] font-bold transition-colors"
                  >
                    {couponLoading ? "…" : t("couponApply")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCoupon(false);
                      setCouponInput("");
                      setCouponError("");
                    }}
                    className="h-9 w-9 flex items-center justify-center text-amber-400 hover:text-amber-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-500">{couponError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Premium unlocked ── */}
      {isPremium && (
        <div className="flex items-center gap-2.5 bg-[#F0FDF8] border border-[#A7F3D0] rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#065F46]">
              {t("premiumUnlocked")}
            </p>
            <p className="text-[11px] text-[#059669]">
              {t("premiumUnlockedDesc")}
            </p>
          </div>
        </div>
      )}

      {/* ── Photos ── */}
      <Card className="shadow-sm border-stone-200 overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={13} className="text-stone-400" />
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                {t("photos")}
              </p>
            </div>
            {isPremium ? (
              <span className="text-[10px] text-stone-400">
                {imageFiles.length}/6
              </span>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <Lock size={9} className="text-amber-500" />
                <span className="text-[10px] text-amber-600 font-semibold">
                  {t("premiumBadge")}
                </span>
              </div>
            )}
          </div>

          {!isPremium ? (
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="w-full relative rounded-xl overflow-hidden border border-stone-100"
            >
              <div className="grid grid-cols-3 gap-1 p-2 blur-[2px] pointer-events-none select-none">
                {[
                  "#e5e7eb",
                  "#d1d5db",
                  "#e5e7eb",
                  "#d1d5db",
                  "#e5e7eb",
                  "#d1d5db",
                ].map((c, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Lock size={18} className="text-stone-400 mb-1" />
                <span className="text-[12px] font-semibold text-stone-600">
                  {t("unlockPhotos")}
                </span>
              </div>
            </button>
          ) : imagePreviews.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-stone-100"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Remove button — always visible on mobile, hover on desktop */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(i);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <X size={12} />
                  </button>
                  {/* Index badge */}
                  <div className="absolute bottom-1 left-1 w-4 h-4 bg-black/40 rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">
                      {i + 1}
                    </span>
                  </div>
                </div>
              ))}
              {imageFiles.length < 6 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors gap-1"
                >
                  <Plus size={18} />
                  <span className="text-[10px] font-medium">
                    {t("addMore")}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-full border-2 border-dashed border-stone-200 rounded-xl py-7 flex flex-col items-center gap-2 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all"
            >
              <ImageIcon size={28} />
              <span className="text-[13px] font-medium">
                {t("tapToAddPhotos")}
              </span>
              <span className="text-[11px] opacity-60">{t("photosHint")}</span>
            </button>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onImagesChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* ── Video ── */}
      <Card className="shadow-sm border-stone-200 overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Video size={13} className="text-stone-400" />
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                {t("videoMessage")}
              </p>
            </div>
            {isPremium ? (
              <span className="text-[10px] text-stone-400">
                {tc("optional")}
              </span>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <Lock size={9} className="text-amber-500" />
                <span className="text-[10px] text-amber-600 font-semibold">
                  {t("premiumBadge")}
                </span>
              </div>
            )}
          </div>

          {!isPremium ? (
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="w-full relative rounded-xl overflow-hidden border border-stone-100"
            >
              <div className="py-8 flex flex-col items-center gap-2 blur-[2px] pointer-events-none select-none">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                  <Video size={20} className="text-stone-300" />
                </div>
                <div className="w-24 h-2 bg-stone-100 rounded-full" />
                <div className="w-16 h-2 bg-stone-100 rounded-full" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Lock size={18} className="text-stone-400 mb-1" />
                <span className="text-[12px] font-semibold text-stone-600">
                  {t("unlockVideo")}
                </span>
              </div>
            </button>
          ) : videoPreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <video
                src={videoPreview}
                controls
                playsInline
                className="w-full rounded-xl max-h-52 bg-black"
              />
              <button
                type="button"
                onClick={onRemoveVideo}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full text-[11px] font-medium transition-colors"
              >
                <X size={11} />
                {t("removeVideo")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-stone-200 rounded-xl py-7 flex flex-col items-center gap-2 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all"
            >
              <Video size={28} />
              <span className="text-[13px] font-medium">
                {t("tapToAddVideo")}
              </span>
              <span className="text-[11px] opacity-60">{t("videoHint")}</span>
            </button>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={onVideoChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="group flex-1 h-12 rounded-2xl border-stone-200 text-stone-600 text-[14px] font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <ChevronLeft
            size={18}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          {tc("back")}
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-[2] h-11 rounded-xl text-[14px] font-semibold bg-[#1D9E75] hover:bg-[#178060] shadow-md shadow-[#1D9E75]/20 disabled:opacity-60"
        >
          {loading ? uploadProgress || tc("creating") : t("generateQR")}
        </Button>
      </div>

      {showUpgrade && (
        // <UpgradeModal
        //   wishId={wishId}
        //   onClose={() => setShowUpgrade(false)}
        //   onUpgraded={handleUpgraded}
        // />
        <CouponModal 
          wishId={wishId}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={handleUpgraded}
        />
      )}
    </div>
  );
}
