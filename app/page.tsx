"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GradientPreset = {
  id: string;
  name: string;
  colors: [string, string];
  direction: "vertical" | "horizontal" | "diagonal";
};

type AccentPreset = {
  id: string;
  name: string;
  style: "waves" | "rings" | "bars" | "none";
};

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1350;

const gradientPresets: GradientPreset[] = [
  { id: "dawn", name: "Neon Dawn", colors: ["#341d7d", "#f72585"], direction: "diagonal" },
  { id: "sunset", name: "Tropical Sunset", colors: ["#f97316", "#4338ca"], direction: "vertical" },
  { id: "mint", name: "Future Mint", colors: ["#22d3ee", "#0f172a"], direction: "horizontal" },
  { id: "rose", name: "Rose Noir", colors: ["#111827", "#ef4444"], direction: "diagonal" },
  { id: "forest", name: "Aurora Forest", colors: ["#0f172a", "#22c55e"], direction: "vertical" },
  { id: "ultra", name: "Ultra Violet", colors: ["#1f2937", "#8b5cf6"], direction: "horizontal" }
];

const accentPresets: AccentPreset[] = [
  { id: "waves", name: "Liquid Waves", style: "waves" },
  { id: "rings", name: "Holographic Rings", style: "rings" },
  { id: "bars", name: "Plasma Bars", style: "bars" },
  { id: "none", name: "Minimal", style: "none" }
];

const alignOptions = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" }
] as const;

const fontOptions = [
  { id: "clash", label: "Clash Display", value: "'Clash Display', var(--font-inter), sans-serif" },
  { id: "inter", label: "Inter Tight", value: "var(--font-inter), sans-serif" },
  { id: "borel", label: "Borel", value: "'Borel', cursive" },
  { id: "archivo", label: "Archivo Black", value: "'Archivo Black', sans-serif" }
] as const;

const posterRatio = POSTER_HEIGHT / POSTER_WIDTH;

function useCanvasSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 360, height: 360 * posterRatio });

  useEffect(() => {
    const syncSize = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = Math.min(container.offsetWidth, 420);
      setSize({ width, height: width * posterRatio });
    };

    syncSize();
    const resizeObserver = new ResizeObserver(syncSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, size };
}

function createGradient(ctx: CanvasRenderingContext2D, preset: GradientPreset) {
  const { colors, direction } = preset;
  let gradient: CanvasGradient;
  switch (direction) {
    case "horizontal":
      gradient = ctx.createLinearGradient(0, 0, POSTER_WIDTH, 0);
      break;
    case "vertical":
      gradient = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
      break;
    default:
      gradient = ctx.createLinearGradient(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  }
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawAccent(ctx: CanvasRenderingContext2D, preset: AccentPreset, accentColor: string) {
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = accentColor;
  switch (preset.style) {
    case "waves": {
      const waveHeight = POSTER_HEIGHT * 0.18;
      for (let i = 0; i < 3; i += 1) {
        const offsetY = POSTER_HEIGHT * 0.25 + i * waveHeight * 0.4;
        ctx.beginPath();
        ctx.moveTo(-200, offsetY);
        ctx.bezierCurveTo(
          POSTER_WIDTH * 0.25,
          offsetY - waveHeight * 0.6,
          POSTER_WIDTH * 0.75,
          offsetY + waveHeight * 0.6,
          POSTER_WIDTH + 200,
          offsetY
        );
        ctx.lineTo(POSTER_WIDTH + 200, offsetY + waveHeight);
        ctx.lineTo(-200, offsetY + waveHeight);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "rings": {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 14;
      ctx.globalAlpha = 0.28;
      for (let radius = POSTER_WIDTH * 0.2; radius < POSTER_WIDTH * 0.8; radius += POSTER_WIDTH * 0.12) {
        ctx.beginPath();
        ctx.arc(POSTER_WIDTH * 0.75, POSTER_HEIGHT * 0.3, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "bars": {
      const barWidth = POSTER_WIDTH * 0.1;
      for (let i = 0; i < 4; i += 1) {
        const x = POSTER_WIDTH * 0.1 + i * barWidth * 1.2;
        const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, "#ffffff22");
        ctx.fillStyle = gradient;
        roundedRectPath(ctx, x, POSTER_HEIGHT * 0.15, barWidth, POSTER_HEIGHT * 0.65, 18);
        ctx.fill();
      }
      break;
    }
    default:
      break;
  }
  ctx.globalAlpha = 1;
}

function drawPoster(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: {
    title: string;
    subtitle: string;
    date: string;
    cta: string;
    accentColor: string;
    gradient: GradientPreset;
    accentPreset: AccentPreset;
    align: typeof alignOptions[number]["id"];
    font: typeof fontOptions[number]["value"];
  }
) {
  const ratio = window.devicePixelRatio ?? 1;
  canvas.width = POSTER_WIDTH * ratio;
  canvas.height = POSTER_HEIGHT * ratio;
  canvas.style.width = `${POSTER_WIDTH}px`;
  canvas.style.height = `${POSTER_HEIGHT}px`;

  if (typeof ctx.resetTransform === "function") {
    ctx.resetTransform();
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  ctx.fillStyle = createGradient(ctx, options.gradient);
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  drawAccent(ctx, options.accentPreset, options.accentColor);

  ctx.fillStyle = "#ffffff18";
  ctx.fillRect(0, POSTER_HEIGHT * 0.78, POSTER_WIDTH, POSTER_HEIGHT * 0.22);

  const padding = POSTER_WIDTH * 0.12;
  const align = options.align;
  const anchorX =
    align === "left"
      ? padding
      : align === "center"
      ? POSTER_WIDTH / 2
      : POSTER_WIDTH - padding;

  ctx.textAlign = align === "left" ? "left" : align === "center" ? "center" : "right";
  ctx.fillStyle = "#f8fafc";
  ctx.shadowColor = "#00000033";
  ctx.shadowBlur = 12;

  ctx.font = `900 ${Math.round(POSTER_WIDTH * 0.11)}px ${options.font}`;
  wrapText(ctx, options.title.toUpperCase(), anchorX, POSTER_HEIGHT * 0.3, POSTER_WIDTH - padding * 2, POSTER_WIDTH * 0.12, 1.15);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#e2e8f0";
  ctx.font = `500 ${Math.round(POSTER_WIDTH * 0.035)}px ${options.font}`;
  wrapText(ctx, options.subtitle, anchorX, POSTER_HEIGHT * 0.58, POSTER_WIDTH - padding * 2, POSTER_WIDTH * 0.05, 1.4);

  ctx.fillStyle = options.accentColor;
  ctx.font = `700 ${Math.round(POSTER_WIDTH * 0.04)}px ${options.font}`;
  ctx.fillText(options.date, anchorX, POSTER_HEIGHT * 0.78);

  ctx.fillStyle = "#0f172a";
  ctx.font = `700 ${Math.round(POSTER_WIDTH * 0.036)}px ${options.font}`;
  const ctaPadding = POSTER_WIDTH * 0.04;
  const ctaWidth = POSTER_WIDTH - padding * 2;
  const ctaHeight = POSTER_HEIGHT * 0.08;
  const ctaX = align === "left" ? padding : align === "center" ? (POSTER_WIDTH - ctaWidth) / 2 : POSTER_WIDTH - padding - ctaWidth;
  const ctaY = POSTER_HEIGHT * 0.84;

  roundedRectPath(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 24);
  ctx.fill();
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.fillText(options.cta, ctaX + ctaWidth / 2, ctaY + ctaHeight / 2 + POSTER_WIDTH * 0.014);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  lineSpacing: number
) {
  if (!text.trim()) return;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight * lineSpacing;
    ctx.fillText(line, x, y);
  });
}

function downloadCanvas(canvas: HTMLCanvasElement) {
  const link = document.createElement("a");
  link.download = `poster-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

const colorSwatches = ["#f97316", "#22d3ee", "#facc15", "#38bdf8", "#f472b6", "#c084fc", "#34d399", "#f87171"];

export default function Page() {
  const [title, setTitle] = useState("Night Pulse Experience");
  const [subtitle, setSubtitle] = useState("Immersive audio-visual performance featuring the city's top DJs and digital artists.");
  const [date, setDate] = useState("SEP 15 • 8 PM");
  const [cta, setCta] = useState("RSVP NOW");
  const [accentColor, setAccentColor] = useState("#22d3ee");
  const [gradientId, setGradientId] = useState<GradientPreset["id"]>("dawn");
  const [accentId, setAccentId] = useState<AccentPreset["id"]>("waves");
  const [align, setAlign] = useState<typeof alignOptions[number]["id"]>("center");
  const [fontId, setFontId] = useState<typeof fontOptions[number]["id"]>("clash");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { containerRef, size } = useCanvasSize();

  const gradient = useMemo(() => gradientPresets.find((preset) => preset.id === gradientId) ?? gradientPresets[0], [gradientId]);
  const accentPreset = useMemo(
    () => accentPresets.find((preset) => preset.id === accentId) ?? accentPresets[0],
    [accentId]
  );
  const font = useMemo(() => fontOptions.find((option) => option.id === fontId) ?? fontOptions[0], [fontId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPoster(canvas, ctx, {
      title,
      subtitle,
      date,
      cta,
      accentColor,
      gradient,
      accentPreset,
      align,
      font: font.value
    });
  }, [title, subtitle, date, cta, accentColor, gradient, accentPreset, align, font]);

  return (
    <main
      style={{
        width: "100%",
        maxWidth: "1200px",
        padding: "48px 24px 72px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: "40px"
      }}
    >
      <section
        style={{
          background: "#111827",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 30px 60px rgba(15, 23, 42, 0.45)",
          border: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 800
            }}
          >
            Poster Forge
          </h1>
          <p style={{ margin: "12px 0 0", color: "#94a3b8", lineHeight: 1.6 }}>
            Generate high-impact Instagram posters with cinematic gradients, typographic control, and export-ready resolution.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gap: "20px"
          }}
        >
          <fieldset
            style={{
              border: "1px solid #1e293b",
              borderRadius: "18px",
              padding: "20px",
              display: "grid",
              gap: "16px"
            }}
          >
            <legend style={{ padding: "0 10px", color: "#38bdf8" }}>Content</legend>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                Headline
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Headline"
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  padding: "0 16px",
                  background: "#0f172a",
                  color: "#f8fafc"
                }}
              />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                Description
              </span>
              <textarea
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Description"
                rows={3}
                style={{
                  borderRadius: "12px",
                  padding: "12px 16px",
                  background: "#0f172a",
                  color: "#f8fafc",
                  resize: "vertical"
                }}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                  Date & Time
                </span>
                <input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  placeholder="Date & Time"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    padding: "0 16px",
                    background: "#0f172a",
                    color: "#f8fafc"
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                  Call To Action
                </span>
                <input
                  value={cta}
                  onChange={(event) => setCta(event.target.value)}
                  placeholder="Call to action"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    padding: "0 16px",
                    background: "#0f172a",
                    color: "#f8fafc"
                  }}
                />
              </label>
            </div>
          </fieldset>

          <fieldset
            style={{
              border: "1px solid #1e293b",
              borderRadius: "18px",
              padding: "20px",
              display: "grid",
              gap: "16px"
            }}
          >
            <legend style={{ padding: "0 10px", color: "#38bdf8" }}>Styles</legend>
            <div style={{ display: "grid", gap: "12px" }}>
              <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                Gradient
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "12px" }}>
                {gradientPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setGradientId(preset.id)}
                    style={{
                      borderRadius: "16px",
                      padding: "14px",
                      background: gradientId === preset.id ? "#172554" : "#0f172a",
                      border: gradientId === preset.id ? "2px solid #38bdf8" : "1px solid #1e293b",
                      textAlign: "left",
                      color: "#f8fafc",
                      display: "grid",
                      gap: "10px"
                    }}
                    type="button"
                  >
                    <div
                      style={{
                        height: "48px",
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`
                      }}
                    />
                    <span style={{ fontSize: "13px", letterSpacing: "0.04em" }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                Accent
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {accentPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setAccentId(preset.id)}
                    style={{
                      borderRadius: "999px",
                      padding: "10px 20px",
                      background: accentId === preset.id ? "#38bdf8" : "#0f172a",
                      color: accentId === preset.id ? "#0f172a" : "#f8fafc",
                      border: "1px solid #1e293b",
                      fontWeight: 600
                    }}
                    type="button"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                Accent Color
              </span>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      border: accentColor === color ? "3px solid #38bdf8" : "3px solid transparent",
                      background: color
                    }}
                    aria-label={`Accent color ${color}`}
                  />
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(event) => setAccentColor(event.target.value)}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "transparent",
                    border: "1px solid #1e293b",
                    padding: 0
                  }}
                  title="Custom accent color"
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                  Alignment
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {alignOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAlign(option.id)}
                      style={{
                        flex: 1,
                        borderRadius: "12px",
                        padding: "12px 0",
                        background: align === option.id ? "#38bdf8" : "#0f172a",
                        color: align === option.id ? "#0f172a" : "#f8fafc",
                        border: "1px solid #1e293b",
                        fontWeight: 600
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </label>
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "14px", letterSpacing: "0.02em", textTransform: "uppercase", color: "#cbd5f5" }}>
                  Typeface
                </span>
                <select
                  value={fontId}
                  onChange={(event) => setFontId(event.target.value as typeof fontId)}
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    padding: "0 16px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #1e293b"
                  }}
                >
                  {fontOptions.map((option) => (
                    <option key={option.id} value={option.id} style={{ color: "#0f172a" }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            borderRadius: "28px",
            background: "#0b1220",
            border: "1px solid #1e293b",
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            boxShadow: "0 40px 80px rgba(8, 14, 28, 0.6)"
          }}
        >
          <canvas
            ref={canvasRef}
            width={POSTER_WIDTH}
            height={POSTER_HEIGHT}
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              borderRadius: "24px",
              boxShadow: "0 30px 60px rgba(8, 14, 28, 0.7)"
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "flex-end"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTitle("Night Pulse Experience");
              setSubtitle("Immersive audio-visual performance featuring the city's top DJs and digital artists.");
              setDate("SEP 15 • 8 PM");
              setCta("RSVP NOW");
              setAccentColor("#22d3ee");
              setGradientId("dawn");
              setAccentId("waves");
              setAlign("center");
              setFontId("clash");
            }}
            style={{
              padding: "14px 22px",
              borderRadius: "14px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#cbd5f5",
              fontWeight: 600
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              downloadCanvas(canvas);
            }}
            style={{
              padding: "14px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #22d3ee, #38bdf8)",
              color: "#0f172a",
              fontWeight: 700,
              border: "none"
            }}
          >
            Export 1080 × 1350 PNG
          </button>
        </div>
      </section>
    </main>
  );
}
