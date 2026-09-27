"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Clock3, Film, RefreshCw, Wifi, WifiOff } from "lucide-react";

type Rate = { iso: string; buy: string; sell: string; flagUrl: string };

const DEFAULT_VIDEO = "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4";
const countryInfo: Record<string, { flag: string; ar: string; en: string }> = {
  AED: { flag: "🇦🇪", ar: "الإمارات", en: "United Arab Emirates" },
  ALL: { flag: "🇦🇱", ar: "ألبانيا", en: "Albania" },
  AUD: { flag: "🇦🇺", ar: "أستراليا", en: "Australia" },
  AZM: { flag: "🇦🇿", ar: "أذربيجان", en: "Azerbaijan" },
  AZN: { flag: "🇦🇿", ar: "أذربيجان", en: "Azerbaijan" },
  BAM: { flag: "🇧🇦", ar: "البوسنة والهرسك", en: "Bosnia & Herzegovina" },
  BDT: { flag: "🇧🇩", ar: "بنغلاديش", en: "Bangladesh" },
  BHD: { flag: "🇧🇭", ar: "البحرين", en: "Bahrain" },
  BND: { flag: "🇧🇳", ar: "بروناي", en: "Brunei" },
  CAD: { flag: "🇨🇦", ar: "كندا", en: "Canada" },
  CHF: { flag: "🇨🇭", ar: "سويسرا", en: "Switzerland" },
  CNY: { flag: "🇨🇳", ar: "الصين", en: "China" },
  CRC: { flag: "🇨🇷", ar: "كوستاريكا", en: "Costa Rica" },
  CZK: { flag: "🇨🇿", ar: "التشيك", en: "Czech Republic" },
  DKK: { flag: "🇩🇰", ar: "الدنمارك", en: "Denmark" },
  DZD: { flag: "🇩🇿", ar: "الجزائر", en: "Algeria" },
  EGP: { flag: "🇪🇬", ar: "مصر", en: "Egypt" },
  EUR: { flag: "🇪🇺", ar: "الاتحاد الأوروبي", en: "European Union" },
  GBP: { flag: "🇬🇧", ar: "المملكة المتحدة", en: "United Kingdom" },
  GEL: { flag: "🇬🇪", ar: "جورجيا", en: "Georgia" },
  HKD: { flag: "🇭🇰", ar: "هونغ كونغ", en: "Hong Kong" },
  HUF: { flag: "🇭🇺", ar: "المجر", en: "Hungary" },
  IDR: { flag: "🇮🇩", ar: "إندونيسيا", en: "Indonesia" },
  INR: { flag: "🇮🇳", ar: "الهند", en: "India" },
  IQD: { flag: "🇮🇶", ar: "العراق", en: "Iraq" },
  JMD: { flag: "🇯🇲", ar: "جامايكا", en: "Jamaica" },
  JOD: { flag: "🇯🇴", ar: "الأردن", en: "Jordan" },
  JPY: { flag: "🇯🇵", ar: "اليابان", en: "Japan" },
  KES: { flag: "🇰🇪", ar: "كينيا", en: "Kenya" },
  KRW: { flag: "🇰🇷", ar: "كوريا الجنوبية", en: "South Korea" },
  KWD: { flag: "🇰🇼", ar: "الكويت", en: "Kuwait" },
  KZT: { flag: "🇰🇿", ar: "كازاخستان", en: "Kazakhstan" },
  LBP: { flag: "🇱🇧", ar: "لبنان", en: "Lebanon" },
  LKR: { flag: "🇱🇰", ar: "سريلانكا", en: "Sri Lanka" },
  LYD: { flag: "🇱🇾", ar: "ليبيا", en: "Libya" },
  MAD: { flag: "🇲🇦", ar: "المغرب", en: "Morocco" },
  MUR: { flag: "🇲🇺", ar: "موريشيوس", en: "Mauritius" },
  MVR: { flag: "🇲🇻", ar: "المالديف", en: "Maldives" },
  MYR: { flag: "🇲🇾", ar: "ماليزيا", en: "Malaysia" },
  NPR: { flag: "🇳🇵", ar: "نيبال", en: "Nepal" },
  NZD: { flag: "🇳🇿", ar: "نيوزيلندا", en: "New Zealand" },
  OMR: { flag: "🇴🇲", ar: "عُمان", en: "Oman" },
  PHP: { flag: "🇵🇭", ar: "الفلبين", en: "Philippines" },
  PKR: { flag: "🇵🇰", ar: "باكستان", en: "Pakistan" },
  PLN: { flag: "🇵🇱", ar: "بولندا", en: "Poland" },
  QAR: { flag: "🇶🇦", ar: "قطر", en: "Qatar" },
  RUR: { flag: "🇷🇺", ar: "روسيا", en: "Russia" },
  SDG: { flag: "🇸🇩", ar: "السودان", en: "Sudan" },
  SEK: { flag: "🇸🇪", ar: "السويد", en: "Sweden" },
  SYP: { flag: "🇸🇾", ar: "سوريا", en: "Syria" },
  THB: { flag: "🇹🇭", ar: "تايلاند", en: "Thailand" },
  TMT: { flag: "🇹🇲", ar: "تركمانستان", en: "Turkmenistan" },
  TND: { flag: "🇹🇳", ar: "تونس", en: "Tunisia" },
  TRL: { flag: "🇹🇷", ar: "تركيا", en: "Turkey" },
  UAH: { flag: "🇺🇦", ar: "أوكرانيا", en: "Ukraine" },
  UGX: { flag: "🇺🇬", ar: "أوغندا", en: "Uganda" },
  USD: { flag: "🇺🇸", ar: "الولايات المتحدة", en: "United States" },
  UZS: { flag: "🇺🇿", ar: "أوزبكستان", en: "Uzbekistan" },
  VND: { flag: "🇻🇳", ar: "فيتنام", en: "Vietnam" },
  YER: { flag: "🇾🇪", ar: "اليمن", en: "Yemen" },
  ZAR: { flag: "🇿🇦", ar: "جنوب أفريقيا", en: "South Africa" },
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
  const country = countryInfo[rate.iso];
  if (country) {
    const countryCode = rate.iso.slice(0, 2).toLowerCase();
    return <img
      className="flag-image"
      src={`https://flagcdn.com/w80/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w160/${countryCode}.png 2x`}
      width="80"
      height="53"
      alt={`علم ${country.ar}`}
    />;
  }
  return <span className="flag-emoji" aria-hidden="true">◈</span>;
}

function RateCard({ rate }: { rate: Rate }) {
  const country = countryInfo[rate.iso] ?? { ar: "دولة غير معروفة", en: "Unknown country" };
  return <article className="rate-card" aria-label={`${country.ar}، ${country.en}، ${rate.iso}: شراء ${rate.buy}، بيع ${rate.sell}`}>
    <div className="currency-mark"><Flag rate={rate} /></div>
    <div className="currency-identity">
      <strong className="currency-code" dir="ltr">{rate.iso}</strong>
      <span className="country-name-ar" dir="rtl">{country.ar}</span>
      <small className="country-name-en" dir="ltr">{country.en}</small>
    </div>
    <span className="rate-divider" />
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
      const response = await fetch(`/api/rates.php?t=${Date.now()}`, { cache: "no-store" });
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
