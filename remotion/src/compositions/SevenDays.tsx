import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, DISCLAIMER, FONTS } from "../brand";

const timeline = [
  {
    day: "Day 1",
    label: "Contract Signed",
    desc: "We lock in your use case, brand voice & integrations",
  },
  {
    day: "Day 3",
    label: "Bot Training",
    desc: "Fine-tuned on your menu, FAQs, policies & pricing",
  },
  {
    day: "Day 5",
    label: "Testing & QA",
    desc: "Stress-tested across 50+ real customer scenarios",
  },
  {
    day: "Day 7",
    label: "LIVE 🟢",
    desc: "Your MannaBot goes live on WhatsApp Business",
    isLive: true,
  },
];

const stats = [
  { value: "0.8s", label: "Response time" },
  { value: "24/7", label: "Always on" },
  { value: "11", label: "Languages" },
  { value: "R800", label: "per month" },
];

export const SevenDays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: 0-2s — title
  const titleProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 80, mass: 1 },
  });
  const subtitleProgress = spring({
    frame: frame - fps * 0.8,
    fps,
    from: 0,
    to: 1,
    config: { damping: 14, stiffness: 200, mass: 0.7 },
  });

  // Phase 2: 2-8s — timeline items
  const timelineStart = 2 * fps;
  const itemDelay = fps * 1.4;

  // Phase 3: 8-10s — stats row
  const statsStart = 8 * fps;
  const statsProgress = spring({
    frame: frame - statsStart,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 100, mass: 0.9 },
  });

  const showTimeline = frame >= timelineStart;
  const showStats = frame >= statsStart;
  const showTitle = frame < timelineStart;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Background grid lines */}
      <AbsoluteFill style={{ opacity: 0.04 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${i * 14.28}%`,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: COLORS.white,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Phase 1: Title */}
      {showTitle && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              opacity: titleProgress,
              transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontFamily: FONTS.heading,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              FROM ZERO TO LIVE
            </div>
          </div>
          <div
            style={{
              opacity: interpolate(subtitleProgress, [0, 1], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `scale(${interpolate(subtitleProgress, [0, 1], [0.6, 1], { extrapolateRight: "clamp" })})`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontFamily: FONTS.heading,
                fontWeight: 900,
                color: COLORS.accent,
                lineHeight: 0.9,
                letterSpacing: -4,
              }}
            >
              IN 7
            </div>
            <div
              style={{
                fontSize: 120,
                fontFamily: FONTS.heading,
                fontWeight: 900,
                color: COLORS.accent,
                lineHeight: 0.9,
                letterSpacing: -4,
              }}
            >
              DAYS.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 2: Timeline */}
      {showTimeline && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "80px 60px 0 60px",
          }}
        >
          {/* Header */}
          <div
            style={{
              marginBottom: 48,
              opacity: interpolate(frame - timelineStart, [0, 20], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontFamily: FONTS.heading,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              From Zero to Live
            </div>
            <div
              style={{
                fontSize: 72,
                fontFamily: FONTS.heading,
                fontWeight: 900,
                color: COLORS.accent,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              In 7 Days.
            </div>
          </div>

          {/* Timeline vertical line */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 35,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: COLORS.border,
              }}
            />

            {timeline.map((item, i) => {
              const itemStart = timelineStart + i * itemDelay;
              const itemProgress = spring({
                frame: frame - itemStart,
                fps,
                from: 0,
                to: 1,
                config: { damping: 18, stiffness: 120, mass: 0.7 },
              });

              if (frame < itemStart) return null;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 40,
                    opacity: itemProgress,
                    transform: `translateX(${interpolate(itemProgress, [0, 1], [-60, 0])}px)`,
                  }}
                >
                  {/* Checkmark circle */}
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      backgroundColor: item.isLive ? COLORS.green : COLORS.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: item.isLive ? 36 : 32,
                      fontWeight: 900,
                      color: COLORS.bg,
                      flexShrink: 0,
                      zIndex: 1,
                      border: `3px solid ${item.isLive ? "#1AAF54" : "#A8E83C"}`,
                    }}
                  >
                    {item.isLive ? "🟢" : "✓"}
                  </div>

                  {/* Content */}
                  <div style={{ marginLeft: 28, paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span
                        style={{
                          fontSize: 22,
                          fontFamily: FONTS.body,
                          fontWeight: 700,
                          color: COLORS.muted,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                        }}
                      >
                        {item.day}
                      </span>
                      <span
                        style={{
                          fontSize: 32,
                          fontFamily: FONTS.heading,
                          fontWeight: 800,
                          color: item.isLive ? COLORS.green : COLORS.white,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontFamily: FONTS.body,
                        color: COLORS.muted,
                        marginTop: 4,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 3: Stats + CTA */}
      {showStats && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "0 40px 60px 40px",
          }}
        >
          <div
            style={{
              width: "100%",
              opacity: statsProgress,
              transform: `translateY(${interpolate(statsProgress, [0, 1], [80, 0])}px)`,
            }}
          >
            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {stats.map((stat, i) => {
                const statDelay = i * 0.1;
                const statOpacity = interpolate(
                  statsProgress,
                  [statDelay, statDelay + 0.4],
                  [0, 1],
                  { extrapolateRight: "clamp" }
                );
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.darkCard,
                      borderRadius: 16,
                      padding: "20px 12px",
                      textAlign: "center",
                      border: `1px solid ${COLORS.border}`,
                      opacity: statOpacity,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 36,
                        fontFamily: FONTS.heading,
                        fontWeight: 900,
                        color: COLORS.accent,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: COLORS.muted,
                        fontFamily: FONTS.body,
                        marginTop: 4,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div
              style={{
                backgroundColor: COLORS.accent,
                borderRadius: 20,
                padding: "32px 40px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontFamily: FONTS.heading,
                  fontWeight: 900,
                  color: COLORS.bg,
                }}
              >
                Free Audit →
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily: FONTS.body,
                  color: COLORS.bg,
                  fontWeight: 600,
                }}
              >
                mannadigitalhub.co.za
              </div>
            </div>

            <div
              style={{
                fontSize: 17,
                color: COLORS.muted,
                fontFamily: FONTS.body,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {DISCLAIMER}
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
