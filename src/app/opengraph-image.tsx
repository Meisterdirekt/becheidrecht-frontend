import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BescheidRecht — KI-Analyse von Behördenbescheiden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #05070a 0%, #0c1220 50%, #0a1628 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9)",
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "white",
              fontWeight: 900,
            }}
          >
            BR
          </div>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            BescheidRecht
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: "800px",
            marginBottom: "48px",
          }}
        >
          KI-gestützte Analyse von Behördenbescheiden
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {["Fehler erkennen", "Fristen wahren", "Widerspruch einlegen"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "12px 28px",
                  borderRadius: "999px",
                  background: "rgba(14, 165, 233, 0.15)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  color: "#38bdf8",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
          }}
        >
          Für Sozialeinrichtungen · DSGVO-konform · Made in Germany
        </div>
      </div>
    ),
    { ...size }
  );
}
