"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#FBF9F4", color: "#3A3F3A" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>LetHub is having a problem</h1>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#687068" }}>
              Please try again in a moment. If it keeps happening, email support@lethub.uk
              {error.digest ? ` and quote reference ${error.digest}` : ""}.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: 24, background: "#C28A78", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
