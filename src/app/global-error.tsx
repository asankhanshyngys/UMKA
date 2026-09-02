"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("UMKA global error", error);
  }, [error]);

  return (
    <html lang="ru">
      <body style={{ margin: 0, background: "#F9F7F2", color: "#17211f", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
          <section style={{ maxWidth: "560px", width: "100%", padding: "40px", textAlign: "center", border: "1px solid #dfe7e3", borderRadius: "24px", background: "#fff" }}>
            <h1>Что-то пошло не так</h1>
            <p>Не удалось загрузить приложение. Попробуйте ещё раз или вернитесь на главную.</p>
            {error.digest ? <small>Код для поддержки: {error.digest}</small> : null}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px" }}>
              <button onClick={reset} style={{ padding: "12px 20px", border: 0, borderRadius: "12px", background: "#1B3C35", color: "#fff", cursor: "pointer" }}>Попробовать снова</button>
              <Link href="/" style={{ padding: "12px 20px", borderRadius: "12px", border: "1px solid #dfe7e3", color: "#1B3C35", textDecoration: "none" }}>На главную</Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
