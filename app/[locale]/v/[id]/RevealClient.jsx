"use client";
import { useState, useEffect, useRef } from "react";
import { getOccasion } from "@/lib/occasions";
import { ChevronDown, Sparkles, Heart, Share2, Gift } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl'
// ── Confetti burst ────────────────────────────────────────────────────────────
function ConfettiCanvas({ trigger }) {
  const canvasRef = useRef(null);


  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#1D9E75",
      "#FFD700",
      "#FF6B6B",
      "#A78BFA",
      "#FB923C",
      "#38BDF8",
      "#F472B6",
    ];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4 - canvas.height * 0.4,
      r: Math.random() * 7 + 3,
      d: Math.random() * 80,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.04,
      shape: Math.random() > 0.5 ? "circle" : "rect",
    }));

    let frame,
      done = false;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltSpeed;
        p.y += Math.cos(p.d) + 2.5;
        p.tilt = Math.sin(p.tiltAngle) * 14;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.ellipse(
            p.x + p.tilt,
            p.y,
            p.r,
            p.r * 0.45,
            p.tilt,
            0,
            Math.PI * 2,
          );
        } else {
          ctx.rect(p.x + p.tilt - p.r / 2, p.y - p.r / 2, p.r, p.r * 1.6);
        }
        ctx.fill();
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      if (!done) frame = requestAnimationFrame(draw);
    };
    draw();
    setTimeout(() => {
      done = true;
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);
    return () => {
      done = true;
      cancelAnimationFrame(frame);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[300]"
    />
  );
}

// ── Story progress bar ────────────────────────────────────────────────────────
function StoryProgress({ total, current, duration }) {
  return (
    <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-white rounded-full"
            style={{
              width: i < current ? "100%" : i === current ? "100%" : "0%",
              transition: i === current ? `width ${duration}ms linear` : "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Floating hearts ───────────────────────────────────────────────────────────
function FloatingHearts({ active }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[150] overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 text-2xl"
          style={{
            left: `${10 + i * 11}%`,
            animation: `floatUp ${2 + i * 0.3}s ease-out ${i * 0.2}s forwards`,
            opacity: 0,
          }}
        >
          {["❤️", "💕", "✨", "💖", "🌟", "💝", "🎊", "💫"][i]}
        </div>
      ))}
    </div>
  );
}

export default function RevealClient({ wish }) {
  const [phase, setPhase] = useState("cover"); // cover | story | reveal
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyKey, setStoryKey] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [hearts, setHearts] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imageList, setImageList] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const storyTimer = useRef(null);
  const STORY_DURATION = 2800;

  const occ = getOccasion(wish?.occasion);
  const t = useTranslations("reveal");

  const slides = [
    { text: `Someone has something for you…`, sub: null },
    { text: `Hey ${wish?.recipient} 👋`, sub: "You've got a wish!" },
    { text: wish?.message, sub: null },
    { text: `— ${wish?.from_name || "Someone"} ❤️`, sub: "With all the love" },
  ];

  useEffect(() => {
    if (!wish?.image_urls) return;
    try {
      const parsed =
        typeof wish.image_urls === "string"
          ? JSON.parse(wish.image_urls)
          : wish.image_urls;
      setImageList(Array.isArray(parsed) ? parsed : [parsed]);
    } catch {
      setImageList([]);
    }
  }, [wish]);

  // Story auto-advance
  useEffect(() => {
    if (phase !== "story") return;
    clearTimeout(storyTimer.current);
    storyTimer.current = setTimeout(() => {
      if (storyIndex < slides.length - 1) {
        setStoryIndex((i) => i + 1);
        setStoryKey((k) => k + 1);
      } else {
        finishStory();
      }
    }, STORY_DURATION);
    return () => clearTimeout(storyTimer.current);
  }, [phase, storyIndex]);

  const startStory = () => {
    setPhase("story");
    setStoryIndex(0);
    setStoryKey(0);
  };

  const finishStory = () => {
    setPhase("reveal");
    setConfetti(true);
    setTimeout(() => setHearts(true), 300);
    setTimeout(() => setHearts(false), 3500);
  };

  const tapStory = (side) => {
    clearTimeout(storyTimer.current);
    if (side === "right") {
      if (storyIndex < slides.length - 1) {
        setStoryIndex((i) => i + 1);
        setStoryKey((k) => k + 1);
      } else {
        finishStory();
      }
    } else {
      if (storyIndex > 0) {
        setStoryIndex((i) => i - 1);
        setStoryKey((k) => k + 1);
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `A wish for ${wish?.recipient}`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (!wish) return null;
  const hasMedia = imageList.length > 0 || wish.video_url;

  return (
    <div
      className="min-h-screen bg-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <ConfettiCanvas trigger={confetti} />
      <FloatingHearts active={hearts} />

      {/* ── COVER ── */}
      {phase === "cover" && (
        <div
          onClick={startStory}
          className="fixed inset-0 z-[100] cursor-pointer flex flex-col items-center justify-center p-8 text-center select-none"
          style={{ background: occ.bg }}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-64 h-64 rounded-full border-2 opacity-20 animate-ping-slow"
              style={{ borderColor: occ.accent }}
            />
            <div
              className="absolute w-48 h-48 rounded-full border opacity-30"
              style={{ borderColor: occ.accent }}
            />
            <div
              className="absolute w-32 h-32 rounded-full opacity-10"
              style={{ background: occ.accent }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div
              className="text-[96px] leading-none mb-6"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              {occ.emoji}
            </div>

            <div
              className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ background: occ.accent, color: "#fff" }}
            >
              {occ.label}
            </div>

            <h2
              className="text-[32px] font-black leading-tight mb-2"
              style={{ color: occ.fg }}
            >
              For {wish.recipient}
            </h2>
            <p
              className="text-[14px] mb-10 opacity-60"
              style={{ color: occ.fg }}
            >
              {wish.from_name
                ? `From ${wish.from_name}`
                : "A special wish awaits"}
            </p>

            {/* Tap button */}
            <div
              className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[15px] text-white shadow-lg"
              style={{
                background: occ.accent,
                boxShadow: `0 8px 24px ${occ.accent}55`,
                animation: "pulse-btn 2s ease-in-out infinite",
              }}
            >
              <Gift size={18} />
              Tap to open
            </div>
          </div>
        </div>
      )}

      {/* ── STORY ── */}
      {phase === "story" && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center select-none"
          style={{ background: occ.bg }}
        >
          <StoryProgress
            total={slides.length}
            current={storyIndex}
            duration={STORY_DURATION}
          />

          {/* Close */}
          <button
            onClick={finishStory}
            className="absolute top-4 right-4 z-20 text-white/50 hover:text-white text-[24px] leading-none transition-colors"
          >
            ×
          </button>

          {/* Slide */}
          <div
            key={storyKey}
            className="text-center px-8 max-w-sm z-10 pointer-events-none"
            style={{ animation: "slideIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <div className="text-[64px] mb-6">{occ.emoji}</div>
            <p
              className="text-[28px] md:text-[36px] font-black leading-snug"
              style={{ color: occ.fg }}
            >
              {slides[storyIndex].text}
            </p>
            {slides[storyIndex].sub && (
              <p
                className="text-[13px] text-white/50 mt-3 font-medium uppercase tracking-widest "
                style={{ color: occ.fg }}
              >
                {slides[storyIndex].sub}
              </p>
            )}
          </div>

          {/* Tap zones */}
          <div className="absolute inset-0 flex z-20">
            <div className="flex-1" onClick={() => tapStory("left")} />
            <div className="flex-1" onClick={() => tapStory("right")} />
          </div>

          {/* Hint */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: occ.accent + "18",
                border: `1px solid ${occ.accent}33`,
                animation: "breathe 2s ease-in-out infinite",
              }}
            >
              {/* Animated dots */}
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{
                      background: occ.accent,
                      animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: occ.accent }}
              >
                Tap to continue
              </span>
              {/* Arrow */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: occ.accent }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1 4h6M4 1l3 3-3 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVEAL ── */}
      <main
        className="transition-all duration-700"
        style={{
          opacity: phase === "reveal" ? 1 : 0,
          pointerEvents: phase === "reveal" ? "auto" : "none",
        }}
      >
        {/* Hero section */}
        <section
          className="min-h-screen flex flex-col items-center justify-center text-center px-8 pt-16 pb-12 relative overflow-hidden"
          style={{ background: occ.bg }}
        >
          {/* Background decoration */}
          <div
            className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-20"
            style={{ background: occ.accent }}
          />
          <div
            className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full opacity-15"
            style={{ background: occ.border }}
          />

          <div className="relative z-10 max-w-sm mx-auto">
            <div
              className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-5"
              style={{ background: occ.accent + "22", color: occ.accent }}
            >
              {occ.label}
            </div>

            <div className="text-[72px] leading-none mb-4">{occ.emoji}</div>

            <h1
              className="text-[42px] font-black leading-none mb-5"
              style={{ color: occ.fg, fontFamily: "Lora, Georgia, serif" }}
            >
              {wish.recipient}
            </h1>

            {/* Message card */}
            <div
              className="rounded-2xl px-6 py-5 mb-6 text-left relative"
              style={{
                background: "#ffffff55",
                border: `1px solid ${occ.border}`,
              }}
            >
              <div
                className="text-[32px] leading-none mb-2 opacity-30"
                style={{ color: occ.accent }}
              >
                "
              </div>
              <p
                className="text-[16px] leading-relaxed font-medium"
                style={{ color: occ.fg }}
              >
                {wish.message}
              </p>
              <div
                className="text-[32px] leading-none text-right opacity-30 -mt-2"
                style={{ color: occ.accent }}
              >
                "
              </div>
            </div>

            {wish.from_name && (
              <p
                className="text-[13px] font-semibold mb-1"
                style={{ color: occ.accent }}
              >
                — {wish.from_name}
              </p>
            )}
            {wish.date && (
              <p className="text-[12px] opacity-50" style={{ color: occ.fg }}>
                {new Date(wish.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}

            {/* Like + Share */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setLiked((l) => !l)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[13px] transition-all active:scale-95"
                style={{
                  background: liked ? "#FF6B6B22" : "#ffffff55",
                  color: liked ? "#FF6B6B" : occ.fg,
                  border: `1px solid ${liked ? "#FF6B6B55" : occ.border}`,
                }}
              >
                <Heart size={15} fill={liked ? "#FF6B6B" : "none"} />
                {liked ? "Loved it!" : "Love this"}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[13px] transition-all active:scale-95"
                style={{
                  background: "#ffffff55",
                  color: occ.fg,
                  border: `1px solid ${occ.border}`,
                }}
              >
                <Share2 size={15} />
                Share
              </button>
            </div>
          </div>

          {hasMedia && (
            <div
              className="mt-10 flex flex-col items-center gap-1 animate-bounce"
              style={{ color: occ.accent }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">
                Scroll for more
              </p>
              <ChevronDown size={18} />
            </div>
          )}
        </section>

        {/* ── Gallery ── */}
        {imageList.length > 0 && (
          <section className="py-12 max-w-md mx-auto px-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-5 text-center">
              Photos
            </p>

            <div className="space-y-3">
              {imageList.map((src, i) => (
                <div
                  key={i}
                  className="w-full overflow-hidden rounded-3xl shadow-lg cursor-pointer active:scale-[0.99] transition-transform"
                  style={{
                    animation: `fadeUp 0.5s ease ${i * 0.15}s both`,
                  }}
                  onClick={() => setLightbox(i)}
                >
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Video ── */}
        {wish.video_url && (
          <section className="py-4 px-5 max-w-md mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4 text-center">
              Video message
            </p>
            <video
              src={wish.video_url}
              controls
              playsInline
              className="w-full rounded-3xl shadow-xl"
              style={{ maxHeight: 320 }}
            />
          </section>
        )}

        {/* ── Footer CTA ── */}
        <footer className="py-2 mb-12 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-[#1D9E75]" />
          </div>
          <p className="text-[13px] text-stone-400 mb-6">{t("footerDesc")}</p>
          <Link href="/">
            <button className="px-8 py-3.5 bg-[#1D9E75] hover:bg-[#178060] text-white rounded-full font-semibold text-[15px] transition-colors shadow-lg shadow-[#1D9E75]/30">
              {t("createOwn")}
            </button>
          </Link>
        </footer>
      </main>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[400] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/60 hover:text-white text-[28px] leading-none"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          {imageList.length > 1 && lightbox > 0 && (
            <button
              className="absolute left-4 text-white text-[36px] leading-none"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((l) => l - 1);
              }}
            >
              ‹
            </button>
          )}
          <img
            src={imageList[lightbox]}
            className="max-w-full max-h-[88vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {imageList.length > 1 && lightbox < imageList.length - 1 && (
            <button
              className="absolute right-4 text-white text-[36px] leading-none"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((l) => l + 1);
              }}
            >
              ›
            </button>
          )}
          <div className="absolute bottom-5 text-white/40 text-[12px]">
            {lightbox + 1} / {imageList.length}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes breathe {
          0%,100% { transform: scale(1);    opacity: 0.8; }
          50%      { transform: scale(1.04); opacity: 1;   }
        }

        @keyframes dotBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60vh) scale(0.5); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes ping-slow {
          0%,100% { transform: scale(1);   opacity: 0.2; }
          50%      { transform: scale(1.15); opacity: 0.05; }
        }
        @keyframes pulse-btn {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        .animate-ping-slow { animation: ping-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
