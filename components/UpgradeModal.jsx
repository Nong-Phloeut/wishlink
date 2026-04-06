"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Video,
  Images,
  Music,
  Download,
  CheckCircle2,
  Loader2,
  Copy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PRICE = 1.0;
const CURRENCY = "USD";

const FEATURES = [
  { icon: Video, key: "featureVideo" },
  { icon: Images, key: "featurePhotos" },
  { icon: Music, key: "featureMusic" },
  { icon: Download, key: "featureQR" },
];

export default function UpgradeModal({ wishId, onClose, onUpgraded }) {
  const t = useTranslations("upgrade");
  const [step, setStep] = useState("plans");
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useState(null);

  const handleStartPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([
          {
            wish_id: wishId,
            amount: PRICE,
            currency: CURRENCY,
            status: "pending",
            payment_method: "aba",
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setPaymentId(data.id);
      setStep("payment");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!screenshot) return;
    setUploading(true);
    try {
      const ext = screenshot.name.split(".").pop();
      const path = `payment-proofs/${paymentId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("wish-media")
        .upload(path, screenshot, { upsert: true });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("wish-media").getPublicUrl(path);
      await supabase
        .from("payments")
        .update({
          status: "pending_review",
          proof_url: publicUrl,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
      await supabase
        .from("wishes")
        .update({ is_premium: true })
        .eq("id", wishId);
      setStep("success");
      setTimeout(() => {
        onUpgraded?.();
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl"
          style={{ maxHeight: "85vh", overflowY: "auto" }}
        >
          {/* Handle + close */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2 sticky top-0 bg-white z-10">
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
            <div className="w-6" />
            <button
              onClick={onClose}
              className="ml-auto p-1.5 rounded-xl text-stone-400 hover:bg-stone-100 transition-colors mt-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Plans ── */}
          {step === "plans" && (
            <div className="px-5 pb-8">
              {/* Hero row */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#1D9E75] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1D9E75]/30">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-[17px] font-bold text-stone-900">
                    {t("title")}
                  </h2>
                  <p className="text-[12px] text-stone-400">{t("subtitle")}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[28px] font-black text-[#1D9E75] leading-none">
                    $1
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {t("oneTime")}
                  </div>
                </div>
              </div>

              {/* Features — compact 2-col grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-5">
                {FEATURES.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2.5"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center flex-shrink-0">
                      <f.icon size={13} className="text-[#1D9E75]" />
                    </div>
                    <span className="text-[12px] font-medium text-stone-700">
                      {t(f.key)}
                    </span>
                  </div>
                ))}
              </div>

              {/* ABA Pay button */}
              <button
                onClick={handleStartPayment}
                disabled={loading}
                className="w-full flex items-center gap-3 bg-[#E31837] hover:bg-[#c01430] active:scale-[0.98] rounded-2xl px-4 py-3.5 transition-all disabled:opacity-60 mb-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🏦</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-white">
                    {t("payAba")}
                  </p>
                  <p className="text-[11px] text-white/70">{t("payAbaDesc")}</p>
                </div>
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <span className="text-white font-bold">→</span>
                )}
              </button>

              <p className="text-center text-[10px] text-stone-300">
                🔒 {t("secureNote")}
              </p>
            </div>
          )}

          {/* ── Payment ── */}
          {step === "payment" && (
            <div className="px-5 pb-8">
              <div className="text-center mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#E31837] flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🏦</span>
                </div>
                <h2 className="text-[16px] font-bold text-stone-900">
                  {t("payTitle")}
                </h2>
                <p className="text-[12px] text-stone-400 mt-0.5">
                  {t("payDesc")}
                </p>
              </div>

              {/* Payment details — compact */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 mb-4 space-y-2.5">
                <DetailRow label={t("accountName")} value="WishLink KH" />
                <DetailRow
                  label={t("abaNumber")}
                  value="012 345 678"
                  copyable
                />
                <DetailRow label={t("amount")} value="$1.00 USD" highlight />
                <DetailRow
                  label={t("memo")}
                  value={`wish-${wishId}`}
                  copyable
                />
              </div>

              {/* Steps — compact */}
              <div className="bg-blue-50 rounded-xl px-3.5 py-3 mb-4 space-y-1.5">
                {[t("step1"), t("step2"), t("step3"), t("step4")].map(
                  (s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold">{i + 1}</span>
                      </div>
                      <span className="text-[12px] text-blue-700">{s}</span>
                    </div>
                  ),
                )}
              </div>

              {/* Screenshot upload */}
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                {t("uploadProof")}
              </p>
              {!preview ? (
                <label className="w-full border-2 border-dashed border-stone-200 rounded-xl py-5 flex flex-col items-center gap-2 text-stone-300 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all cursor-pointer mb-3">
                  <span className="text-2xl">📸</span>
                  <span className="text-[12px] font-medium text-stone-500">
                    {t("tapUpload")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleScreenshot}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative mb-3 rounded-xl overflow-hidden border border-stone-200">
                  <img
                    src={preview}
                    alt="proof"
                    className="w-full object-cover max-h-36"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[12px]"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-1.5">
                    <p className="text-white text-[11px] font-medium">
                      ✓ {t("screenshotReady")}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmitProof}
                disabled={uploading || !screenshot}
                className="w-full h-11 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-white text-[14px] font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />{" "}
                    {t("verifying")}
                  </>
                ) : (
                  t("submitUnlock")
                )}
              </button>

              <button
                onClick={() => setStep("plans")}
                className="w-full text-center text-[11px] text-stone-400 hover:text-stone-600 mt-2.5 transition-colors"
              >
                ← {t("back")}
              </button>
            </div>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <div className="px-5 pb-10 flex flex-col items-center text-center pt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 rounded-full bg-[#F0FDF8] flex items-center justify-center mb-4"
              >
                <CheckCircle2 size={32} className="text-[#1D9E75]" />
              </motion.div>
              <h2 className="text-[20px] font-bold text-stone-900 mb-1">
                {t("successTitle")}
              </h2>
              <p className="text-[13px] text-stone-400 leading-relaxed">
                {t("successDesc")}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DetailRow({ label, value, copyable, highlight }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-stone-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[13px] font-semibold",
            highlight ? "text-[#1D9E75]" : "text-stone-700",
          )}
        >
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-[10px] font-bold text-[#1D9E75] bg-[#F0FDF8] border border-[#A7F3D0] px-1.5 py-0.5 rounded-md"
          >
            {copied ? "✓" : <Copy size={10} />}
          </button>
        )}
      </div>
    </div>
  );
}
