"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Clock3, Film, RefreshCw, Wifi, WifiOff } from "lucide-react";

type Rate = { iso: string; buy: string; sell: string; flagUrl: string };

const FLAG_BASE = "https://rates.clearviewsys.com/alsharhan/uploads/ho/";
const DEFAULT_VIDEO = "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";
const flagEmoji: Record<string, string> = {
  AED: "🇦🇪", AUD: "🇦🇺", BHD: "🇧🇭", CAD: "🇨🇦", CHF: "🇨🇭", CNY: "🇨🇳",
  EGP: "🇪🇬", EUR: "🇪🇺", GBP: "🇬🇧", INR: "🇮🇳", IQD: "🇮🇶", JOD: "🇯🇴",
  JPY: "🇯🇵", KWD: "🇰🇼", OMR: "🇴🇲", QAR: "🇶🇦", SAR: "🇸🇦", USD: "🇺🇸",
};

function parseRates(xmlText: string) {
  const documentXml = new DOMParser().parseFromString(xmlText, "text/xml");
  if (documentXml.querySelector("parsererror")) throw new Error("Invalid XML");
  const text = (node: Element, selector: string) => node.querySelector(selector)?.textContent?.trim() ?? "";
  const rates = Array.from(documentXml.querySelectorAll("RATE"))
    .map((node) => ({ iso: text(node, "ISO"), buy: text(node, "WEBUY"), sell: text(node, "WESELL"), flagUrl: text(node, "FLAGURL") }))
    .filter((rate) => rate.iso && rate.buy && rate.sell && (rate.buy !== "0" || rate.sell !== "0"));
  return { rates, timestamp: documentXml.querySelector("TIMESTAMP")?.textContent?.trim() ?? "" };
}

function Flag({ rate }: { rate: Rate }) {
  const [failed, setFailed] = useState(false);
  if (!rate.flagUrl || failed) return <span className="flag-emoji" aria-hidden="true">{flagEmoji[rate.iso] ?? "◈"}</span>;
  const src = new URL(rate.flagUrl.replace(/^\/+/, ""), FLAG_BASE).toString();
  return <img className="flag-image" src={src} alt="" onError={() => setFailed(true)} />;
}

function RateCard({ rate }: { rate: Rate }) {
  return <article className="rate-card" aria-label={`${rate.iso}: شراء ${rate.buy}، بيع ${rate.sell}`}>
    <div className="currency-mark"><Flag rate={rate} /></div>
    <strong className="currency-code" dir="ltr">{rate.iso}</strong><span className="rate-divider" />
    <span className="rate-value"><small>شراء</small><b dir="ltr">{rate.buy}</b></span>
    <span className="rate-value sell"><small>بيع</small><b dir="ltr">{rate.sell}</b></span>
  </article>;
}

export default function Home() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [timestamp, setTimestamp] = useState("");
  const [source, setSource] = useState<"live" | "local" | "error">("local");
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO);
  const objectUrl = useRef<string | null>(null);

  const loadRates = useCallback(async () => {
    try {
      const response = await fetch(`/api/rates?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = parseRates(await response.text());
      if (!result.rates.length) throw new Error("No rates");
      setRates(result.rates); setTimestamp(result.timestamp);
      setSource(response.headers.get("X-Rates-Source") === "live" ? "live" : "local");
    } catch {
      try {
        const response = await fetch(`/rateswithcss.xml?t=${Date.now()}`, { cache: "no-store" });
        const result = parseRates(await response.text());
        setRates(result.rates); setTimestamp(result.timestamp); setSource("local");
      } catch { setSource("error"); }
    } finally { setLastChecked(new Date()); setLoading(false); }
  }, []);

  useEffect(() => { loadRates(); const timer = window.setInterval(loadRates, 10_000); return () => window.clearInterval(timer); }, [loadRates]);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function chooseVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file); setVideoSrc(objectUrl.current);
  }

  const tickerRates = rates.length ? rates : [
    { iso: "USD", buy: "—", sell: "—", flagUrl: "" }, { iso: "EUR", buy: "—", sell: "—", flagUrl: "" }, { iso: "GBP", buy: "—", sell: "—", flagUrl: "" },
  ];

  return <main className="display-shell" dir="rtl">
    <section className="video-stage" aria-label="شاشة الفيديو">
      <video key={videoSrc} autoPlay muted loop playsInline controls preload="metadata"><source src={videoSrc} type="video/mp4" />متصفحك لا يدعم تشغيل الفيديو.</video>
      <div className="video-shade" />
      <header className="topbar">
        <div className="brand"><span className="brand-mark">ص</span><div><strong>شاشة الصرافة</strong><small>أسعار العملات المباشرة</small></div></div>
        <label className="video-picker"><Film size={18} aria-hidden="true" />اختر فيديو العرض<input type="file" accept="video/mp4,video/webm,video/ogg" onChange={chooseVideo} /></label>
      </header>
      <div className="screen-copy"><span className="eyebrow">مرحبًا بكم</span><h1>خدمة أسرع، وأسعار واضحة</h1><p>تتحدّث الأسعار تلقائيًا كل 10 ثوانٍ</p></div>
      <div className={`connection-pill ${source}`} role="status">
        {source === "live" ? <Wifi size={17} /> : source === "error" ? <WifiOff size={17} /> : <RefreshCw size={17} />}
        <span>{source === "live" ? "متصل بالمصدر المباشر" : source === "error" ? "تعذر تحديث الأسعار" : "عرض النسخة المحلية"}</span>
      </div>
    </section>
    <section className="ticker" aria-label="شريط أسعار العملات">
      <div className="ticker-label"><span className="live-dot" /><div><b>أسعار الصرف</b><small>{loading ? "جارٍ التحميل" : `${rates.length} عملة متاحة`}</small></div></div>
      <div className="ticker-window"><div className="ticker-track">{[0, 1].map((copy) => <div className="ticker-set" key={copy} aria-hidden={copy === 1}>{tickerRates.map((rate) => <RateCard key={`${copy}-${rate.iso}`} rate={rate} />)}</div>)}</div></div>
      <div className="ticker-time"><Clock3 size={18} aria-hidden="true" /><div><small>آخر فحص</small><b dir="ltr">{lastChecked?.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) ?? "--:--:--"}</b></div></div>
    </section>
    <span className="sr-only" aria-live="polite">{timestamp}</span>
  </main>;
}
