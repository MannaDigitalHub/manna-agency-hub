import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, DISCLAIMER, FONTS } from "../brand";

const botReplyLines = [
  "Hi Sarah! 👋 Thanks for reaching out.",
  "The Deluxe Suite is available on 12 April.",
  "That's R4,350/night including breakfast.",
  "Shall I reserve it for you right now?",
  "I can confirm instantly — just say yes! ✓",
];

export const AfterHours: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: 0-2s — clock + closed message
  const clockProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });

  // Phase 2: 2-4s — notification slides in
  const notifStart = 2 * fps;
  const notifProgress = spring({
    frame: frame - notifStart,
    fps,
    from: 0,
    to: 1,
    config: { damping: 15, stiffness: 180, mass: 0.6 },
  });

  // Phase 3: 4-7s — bot reply lines type in
  const replyStart = 4 * fps;
  const replyDelay = fps * 0.55;

  // Phase 4: 7-9s — lead captured
  const captureStart = 7 * fps;
  const captureProgress = spring({
    frame: frame - captureStart,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 140, mass: 0.7 },
  });

  // Phase 5: 9-10s — CTA
  const ctaStart = 9 * fps;
  const ctaProgress = spring({
    frame: frame - ctaStart,
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, stiffness: 120, mass: 0.8 },
  });

  const isNotifPhase = frame >= notifStart;
  const isReplyPhase = frame >= replyStart;
  const isCapturePhase = frame >= captureStart;
  const isCtaPhase = frame >= ctaStart;
  const isClockPhase = frame < notifStart;

  // Clock hand animation — sweep to 23:41
  const hourAngle = interpolate(clockProgress, [0, 1], [0, 360 * (23 / 24) + 360 * (41 / 60) / 12], {
    extrapolateRight: "clamp",
  });
  const minuteAngle = interpolate(clockProgress, [0, 1], [0, 360 * (41 / 60) + 360 * 4.1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Stars background */}
      <AbsoluteFill style={{ opacity: 0.3 }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 7.3 + 3) % 100}%`,
              top: `${(i * 13.7 + 5) % 60}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              borderRadius: "50%",
              backgroundColor: COLORS.white,
              opacity: 0.4 + (i % 5) * 0.12,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Phase 1: Clock */}
      {isClockPhase && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            opacity: clockProgress,
            transform: `scale(${interpolate(clockProgress, [0, 1], [0.9, 1])})`,
          }}
        >
          {/* Analog clock */}
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              border: `4px solid ${COLORS.muted}`,
              position: "relative",
              marginBottom: 40,
              backgroundColor: COLORS.darkCard,
            }}
          >
            {/* Hour markers */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 20 : 12,
                  backgroundColor: i % 3 === 0 ? COLORS.white : COLORS.muted,
                  transformOrigin: "center bottom",
                  transform: `translateX(-50%) translateY(-140px) rotate(${i * 30}deg)`,
                  borderRadius: 2,
                }}
              />
            ))}
            {/* Hour hand */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 4,
                height: 80,
                backgroundColor: COLORS.white,
                transformOrigin: "center bottom",
                transform: `translateX(-50%) translateY(-80px) rotate(${hourAngle}deg)`,
                borderRadius: 4,
              }}
            />
            {/* Minute hand */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 3,
                height: 110,
                backgroundColor: COLORS.accent,
                transformOrigin: "center bottom",
                transform: `translateX(-50%) translateY(-110px) rotate(${minuteAngle}deg)`,
                borderRadius: 3,
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: COLORS.accent,
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Digital time */}
            <div
              style={{
                position: "absolute",
                bottom: 52,
                left: 0,
                right: 0,
                textAlign: "center",
                fontSize: 28,
                fontFamily: FONTS.heading,
                fontWeight: 700,
                color: COLORS.accent,
                letterSpacing: 2,
              }}
            >
              23:41
            </div>
          </div>

          <div
            style={{
              fontSize: 56,
              fontFamily: FONTS.heading,
              fontWeight: 900,
              color: COLORS.white,
              letterSpacing: -1,
              textAlign: "center",
            }}
          >
            Your business
          </div>
          <div
            style={{
              fontSize: 56,
              fontFamily: FONTS.heading,
              fontWeight: 900,
              color: COLORS.muted,
              letterSpacing: -1,
              textAlign: "center",
            }}
          >
            is closed.
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 2–5: Chat view */}
      {isNotifPhase && (
        <AbsoluteFill style={{ padding: "60px 40px 0 40px" }}>
          {/* WhatsApp notification banner */}
          <div
            style={{
              backgroundColor: COLORS.darkCard,
              borderRadius: 20,
              padding: "20px 24px",
              marginBottom: 32,
              border: `1px solid ${COLORS.border}`,
              opacity: notifProgress,
              transform: `translateY(${interpolate(notifProgress, [0, 1], [-40, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: COLORS.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              💬
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontFamily: FONTS.heading,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                WhatsApp · now
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: COLORS.muted,
                  fontFamily: FONTS.body,
                }}
              >
                Sarah M.: "Hi, is the Deluxe Suite..."
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: COLORS.green,
                flexShrink: 0,
              }}
            />
          </div>

          {/* Chat header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 24,
              opacity: interpolate(notifProgress, [0.5, 1], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                backgroundColor: "#2A3542",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                marginRight: 14,
              }}
            >
              👩
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily: FONTS.heading,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                Sarah M.
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.muted,
                  fontFamily: FONTS.body,
                }}
              >
                online
              </div>
            </div>
          </div>

          {/* Customer message */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 20,
              opacity: interpolate(notifProgress, [0.6, 1], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateX(${interpolate(notifProgress, [0.6, 1], [-30, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: COLORS.chatBubbleIn,
                borderRadius: "4px 18px 18px 18px",
                padding: "14px 20px",
                maxWidth: "78%",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontFamily: FONTS.body,
                  color: COLORS.white,
                  lineHeight: 1.4,
                }}
              >
                Hi, is the Deluxe Suite available on 12 April? What's the rate with breakfast included?
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.muted,
                  marginTop: 6,
                  fontFamily: FONTS.body,
                }}
              >
                23:41
              </div>
            </div>
          </div>

          {/* MannaBot typing indicator → then reply */}
          {isReplyPhase && (
            <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "column", alignItems: "flex-end" }}>
              {/* MannaBot label */}
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.green,
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  marginBottom: 8,
                  opacity: interpolate(frame - replyStart, [0, 10], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                MannaBot · 23:41 · responded in 0.8s
              </div>

              <div
                style={{
                  backgroundColor: COLORS.chatBubbleOut,
                  borderRadius: "18px 4px 18px 18px",
                  padding: "16px 20px",
                  maxWidth: "80%",
                  border: `1px solid #2A6B42`,
                }}
              >
                {botReplyLines.map((line, i) => {
                  const lineStart = replyStart + i * replyDelay;
                  const lineProgress = spring({
                    frame: frame - lineStart,
                    fps,
                    from: 0,
                    to: 1,
                    config: { damping: 20, stiffness: 180, mass: 0.5 },
                  });
                  if (frame < lineStart) return null;
                  return (
                    <div
                      key={i}
                      style={{
                        fontSize: 25,
                        fontFamily: FONTS.body,
                        color: COLORS.white,
                        lineHeight: 1.45,
                        opacity: lineProgress,
                        transform: `translateX(${interpolate(lineProgress, [0, 1], [20, 0])}px)`,
                        marginBottom: i < botReplyLines.length - 1 ? 4 : 0,
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* Phase 4: Lead captured */}
      {isCapturePhase && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "0 40px 300px 40px",
          }}
        >
          <div
            style={{
              width: "100%",
              opacity: captureProgress,
              transform: `translateY(${interpolate(captureProgress, [0, 1], [60, 0])}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: "#0D2A18",
                border: `2px solid ${COLORS.green}`,
                borderRadius: 20,
                padding: "28px 36px",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ fontSize: 48 }}>💰</div>
              <div>
                <div
                  style={{
                    fontSize: 36,
                    fontFamily: FONTS.heading,
                    fontWeight: 900,
                    color: COLORS.green,
                  }}
                >
                  Lead captured
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontFamily: FONTS.body,
                    color: COLORS.white,
                    fontWeight: 700,
                  }}
                >
                  R4,350 booking in progress
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 5: CTA */}
      {isCtaPhase && (
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
              opacity: ctaProgress,
              transform: `translateY(${interpolate(ctaProgress, [0, 1], [60, 0])}px)`,
            }}
          >
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
