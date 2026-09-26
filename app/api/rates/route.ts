const LIVE_RATES_URL =
  "https://rates.clearviewsys.com/alsharhan/uploads/ho/rateswithcss.xml";

const headers = {
  "Content-Type": "application/xml; charset=iso-8859-1",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function GET(request: Request) {
  try {
    const url = `${LIVE_RATES_URL}?t=${Date.now()}`;
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
      headers: { Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
    });
    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    const xml = await response.arrayBuffer();
    return new Response(xml, { headers: { ...headers, "X-Rates-Source": "live" } });
  } catch {
    const fallbackUrl = new URL("/rateswithcss.xml", request.url);
    const fallback = await fetch(fallbackUrl, { cache: "no-store" });
    if (!fallback.ok) {
      return new Response("Rates are temporarily unavailable", { status: 503, headers });
    }
    return new Response(await fallback.arrayBuffer(), {
      headers: { ...headers, "X-Rates-Source": "local" },
    });
  }
}
