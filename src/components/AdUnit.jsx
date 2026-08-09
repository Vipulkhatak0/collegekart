import { useEffect, useRef } from "react";

export default function AdUnit({ slot, format = "auto" }) {
  const insRef = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (!window.adsbygoogle) {
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3826740022210118";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) { /* ad blocked or not ready, ignore */ }
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-3826740022210118"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}