import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, DISCLAIMER, FONTS } from "../brand";

const messages = [
  { time: "19:43", text: "Hi, I'd like to book a table for 4 on Saturday?" },
  { time: "21:15", text: "Hello? Anyone there?" },
  { time: "23:01", text: "Just need to confirm — is Saturday available?" },
  { time: "08:04", text: "Booked elsewhere. Thanks anyway.", isLast: true },
];

const mannaBotReply = {
  time: "08:04",
  text: "Hi! Thanks for reaching out 😊 Saturday is available for a table of 4 at 18:00 or 19:30. Which works for you?",
  confirmText: "Booking confirmed · R2,800",
};

function ChatBubble({
  message,
  isIncoming,
  progress,
  isBot = false,
}: {
  message: { time: string; text: string; isLast?: boolean };
  isIncoming: boolean;
  progress: number;
  isBot?: boolean;
}) {
  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 0.6], [40, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isIncoming ? "flex-start" : "flex-end",
        marginBottom: 16,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          backgroundColor: isIncoming
            ? isBot
              ? COLORS.chatBubbleOut
              : COLORS.chatBubbleIn
            : COLORS.chatBubbleOut,
          borderRadius: isIncoming ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          padding: "12px 16px",
          border: `1px solid ${isIncoming ? COLORS.border : "#2A6B42"}`,
        }}
      >
        {isBot && (
          <div
            style={{
              fontSize: 20,
              fontFamily: FONTS.body,
              color: COLORS.accent,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            MannaBot
          </div>
        )}
        <div
          style={{
            fontSize: 26,
            fontFamily: FONTS.body,
            color: message.isLast && !isBot ? COLORS.muted : COLORS.white,
            lineHeight: 1.4,
          }}
        >
          {message.text}
        </div>
        <div
          style={{
            fontSize: 20,
            color: COLORS.muted,
            marginTop: 6,
            fontFamily: FONTS.body,
            textAlign: isIncoming ? "left" : "right",
          }}
        >
          {message.time}
        </div>
      </div>
    </div>
  );
}

function Counter({
  value,
  progress,
}: {
  value: number;
  progress: number;
}) {
  const displayValue = Math.floor(
    interpolate(progress, [0, 1], [0, value], { extrapolateRight: "clamp" })
  );

  return (
    <div
      style={{
        fontSize: 96,
        fontFamily: FONTS.heading,
        fontWeight: 900,
        color: COLORS.red,
        letterSpacing: -2,
      }}
    >
      R{displayValue.toLocaleString("en-ZA")}
    </div>
  );
}

export const MissedMessage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: 0-2s — opening text
  const headlineProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });

  // Phase 2: 2-5s — chat slides up
  const chatPhaseStart = 2 * fps;
  const chatPhaseEnd = 5 * fps;

  // Phase 3: 5-7s — red flash + counter
  const flashStart = 5 * fps;
  const flashEnd = 7 * fps;
  const flashProgress = interpolate(frame, [flashStart, flashStart + 8, flashEnd - 8, flashEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterProgress = interpolate(frame, [flashStart, flashEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 4: 7-10s — MannaBot reply
  const replyStart = 7 * fps;
  const replyProgress = spring({
    frame: frame - replyStart,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  // Phase 5: 10-12s — CTA
  const ctaStart = 10 * fps;
  const ctaProgress = spring({
    frame: frame - ctaStart,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 100, mass: 0.8 },
  });

  const isFlashPhase = frame >= flashStart && frame < flashEnd;
  const isReplyPhase = frame >= replyStart;
  const isCtaPhase = frame >= ctaStart;
  const isChatPhase = frame >= chatPhaseStart;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Phase 1: Opening headline */}
      {!isChatPhase && (
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              opacity: headlineProgress,
              transform: `scale(${interpolate(headlineProgress, [0, 1], [0.85, 1])})`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 88,
                fontFamily: FONTS.heading,
                fontWeight: 900,
                color: COLORS.accent,
                lineHeight: 1.1,
                letterSpacing: -2,
              }}
            >
              R14,000
            </div>
            <div
              style={{
                fontSize: 52,
                fontFamily: FONTS.heading,
                fontWeight: 700,
                color: COLORS.white,
                marginTop: 16,
                letterSpacing: -1,
              }}
            >
              LOST IN ONE WEEKEND.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 2-4: Chat UI */}
      {isChatPhase && (
        <AbsoluteFill style={{ padding: "60px 40px 0 40px" }}>
          {/* WhatsApp header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              backgroundColor: COLORS.darkCard,
              borderRadius: 20,
              marginBottom: 24,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: COLORS.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginRight: 16,
              }}
            >
              🏪
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
                Your Business
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: isReplyPhase ? COLORS.green : COLORS.red,
                  fontFamily: FONTS.body,
                }}
              >
                {isReplyPhase ? "● Online" : "● Last seen yesterday"}
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 32 }}>📱</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "hidden" }}>
            {messages.map((msg, i) => {
              const msgStart = chatPhaseStart + i * (fps * 0.75);
              const msgProgress = spring({
                frame: frame - msgStart,
                fps,
                from: 0,
                to: 1,
                config: { damping: 18, stiffness: 120, mass: 0.6 },
              });
              if (frame < msgStart) return null;
              return (
                <ChatBubble
                  key={i}
                  message={msg}
                  isIncoming={true}
                  progress={msgProgress}
                />
              );
            })}

            {/* MannaBot reply */}
            {isReplyPhase && (
              <>
                {/* Response time indicator */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 22,
                    color: COLORS.muted,
                    fontFamily: FONTS.body,
                    marginBottom: 12,
                    opacity: replyProgress,
                  }}
                >
                  MannaBot responded in{" "}
                  <span style={{ color: COLORS.green, fontWeight: 700 }}>
                    0.8s
                  </span>
                </div>
                <ChatBubble
                  message={mannaBotReply}
                  isIncoming={false}
                  progress={replyProgress}
                  isBot={true}
                />
                {/* Confirmed pill */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    opacity: interpolate(replyProgress, [0.6, 1], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                    transform: `translateY(${interpolate(replyProgress, [0.6, 1], [20, 0], { extrapolateRight: "clamp" })}px)`,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: COLORS.green,
                      borderRadius: 40,
                      padding: "10px 24px",
                      fontSize: 24,
                      fontFamily: FONTS.heading,
                      fontWeight: 700,
                      color: COLORS.white,
                    }}
                  >
                    ✓ {mannaBotReply.confirmText}
                  </div>
                </div>
              </>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 3: Red flash + counter overlay */}
      {isFlashPhase && !isReplyPhase && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(255,59,48,${flashProgress * 0.25})`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 260,
          }}
        >
          <div
            style={{
              textAlign: "center",
              opacity: flashProgress,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontFamily: FONTS.body,
                color: COLORS.white,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Revenue lost this weekend
            </div>
            <Counter value={14000} progress={counterProgress} />
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 5: CTA card */}
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
              transform: `translateY(${interpolate(ctaProgress, [0, 1], [80, 0])}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: COLORS.accent,
                borderRadius: 24,
                padding: "40px 48px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  fontFamily: FONTS.heading,
                  fontWeight: 900,
                  color: COLORS.bg,
                  lineHeight: 1.2,
                }}
              >
                Free Audit →
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontFamily: FONTS.body,
                  color: COLORS.bg,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                mannadigitalhub.co.za
              </div>
            </div>
            <div
              style={{
                fontSize: 18,
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
