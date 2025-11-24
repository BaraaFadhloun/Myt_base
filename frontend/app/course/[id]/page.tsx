"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { isMobile, isTablet } from "react-device-detect";
import HistoryWindow from "@/components/HistoryWindow";
import TypingMessage from "@/components/TypingMessage";
import MessageBar from "@/components/MessageBar";
import MessageButton from "@/components/MessageButton";
import "@/styles/MessageBar.css";
import HighlightedCode from "@/components/HighlightedCode";
import PurpleVideoPlayer, {
  type VideoPlayerRef,
} from "@/components/PurpleVideoPlayer";

export default function CoursePage() {
  const [isMessageBarVisible, setIsMessageBarVisible] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(10);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);
  const [isTypingInProgress, setIsTypingInProgress] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [refocusCounter, setRefocusCounter] = useState(0);
  const [activeExample, setActiveExample] = useState<{
    language: string;
    code: string;
  } | null>(null);
  const [isExamplePinned, setIsExamplePinned] = useState(false);
  const [isExampleHovered, setIsExampleHovered] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(1);
  const [delayMultiplier, setDelayMultiplier] = useState(1);
  const [typingMode, setTypingMode] = useState<"auto" | "manual">("manual");
  const [isManualHoldActive, setIsManualHoldActive] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [resumeSignal, setResumeSignal] = useState<{ key: number; skipToIndex?: number } | null>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const continuePromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pendingExampleRef = useRef<{ language: string; code: string } | null>(
    null
  );
  const manualHoldActiveRef = useRef(false);
  const [manualHoldDisplay, setManualHoldDisplay] = useState<
    string | undefined
  >(undefined);
  const isExamplePinnedRef = useRef(isExamplePinned);
  const typingModeRef = useRef<"auto" | "manual">("manual");
  const lastManualHoldKeyRef = useRef<string | null>(null);
  const skipHoldKeyRef = useRef<string | null>(null);
  const upcomingExampleSegmentRef = useRef<string | null>(null);
  const upcomingExampleIndexRef = useRef<number | null>(null);
  const resumeSignalKeyRef = useRef(0);

  const emitResumeSignal = useCallback(
    (skipToIndex?: number) => {
      resumeSignalKeyRef.current += 1;
      if (typeof skipToIndex === "number" && Number.isFinite(skipToIndex)) {
        setResumeSignal({ key: resumeSignalKeyRef.current, skipToIndex });
      } else {
        setResumeSignal({ key: resumeSignalKeyRef.current });
      }
    },
    [setResumeSignal]
  );

  const toggleMessageBar = () => {
    setIsMessageBarVisible(!isMessageBarVisible);
  };

  const stopTypingManually = useCallback(() => {
    if (continuePromptTimerRef.current) {
      clearTimeout(continuePromptTimerRef.current);
      continuePromptTimerRef.current = null;
    }

    pendingExampleRef.current = null;
    manualHoldActiveRef.current = false;
    setIsManualHoldActive(false);
    setShowContinuePrompt(false);
    setManualHoldDisplay(undefined);
    lastManualHoldKeyRef.current = null;
    skipHoldKeyRef.current = null;
    upcomingExampleSegmentRef.current = null;
    upcomingExampleIndexRef.current = null;

    setActiveExample(null);
    setIsExamplePinned(false);
    setIsExampleHovered(false);
    setIsTypingInProgress(false);
    setIsThinking(false);
    setApiResponse("");
    setIsMessageBarVisible(true);

    emitResumeSignal(Number.MAX_SAFE_INTEGER);
  }, [
    emitResumeSignal,
    setActiveExample,
    setIsExamplePinned,
    setIsManualHoldActive,
    setManualHoldDisplay,
    setShowContinuePrompt,
    setIsExampleHovered,
    setIsTypingInProgress,
    setIsThinking,
    setApiResponse,
    setIsMessageBarVisible,
  ]);

  const handleMessageSent = async (message: string) => {
    if (isTypingInProgress) {
      console.log("[v0] Message blocked - typing in progress");
      return;
    }

    setIsThinking(true);
    setRemainingMessages((prev) => Math.max(0, prev - 1));
    setIsMessageBarVisible(true);
    setActiveExample(null);
    setIsExamplePinned(false);

    const userEntry = { role: "user" as const, content: message };
    const historySnapshot = [...conversationHistory, userEntry];
    setConversationHistory(historySnapshot);

    try {
      /* const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: historySnapshot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Chat service error");
      }

      const assistantMessage: string = data.response;
      */

      const assistantMessage = `Loops in Python help you repeat actions. 

There are two main types of loops: for loops and while loops. 

A for loop lets you iterate over a sequence, like a list. 

Here’s a simple example of a for loop:

\`\`\`python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
\`\`\`

This will print each fruit in the list.

A while loop continues running as long as a condition is true. 

Here’s a basic example of a while loop:

\`\`\`python
count = 0

while count < 5:
    print(count)
    count += 1
\`\`\`

This will print numbers from 0 to 4. 

Do you have any specific questions about loops?`;

      setApiResponse(assistantMessage);
      setIsTypingInProgress(true);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      console.error("Error:", error);
      const fallbackMessage = "Sorry, I couldn't process your request.";
      setApiResponse(fallbackMessage);
      setIsTypingInProgress(true);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: fallbackMessage },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleTypingComplete = () => {
    setIsTypingInProgress(false);
    setIsMessageBarVisible(true);
    setRefocusCounter((prev) => prev + 1);
    if (!isExamplePinned) {
      setActiveExample(null);
    }
    setApiResponse("");
    emitResumeSignal();
  };

  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setIsVideoPlaying(isPlaying);
  }, []);

  const getSegmentDelay = useCallback(
    (segment: string) => {
      const hasCodeBlock = /```[\s\S]*?```/.test(segment);
      const hasVisibleText =
        segment.replace(/```[\s\S]*?```/g, "").trim().length > 0;

      if (hasCodeBlock && !hasVisibleText) {
        return 5000 * delayMultiplier;
      }

      if (hasCodeBlock) {
        return 4000 * delayMultiplier;
      }

      return 2000 * delayMultiplier;
    },
    [delayMultiplier]
  );

  const handleSegmentComplete = useCallback(
    ({
      segment,
      isLastSegment,
      nextSegment,
      nextIndex,
    }: {
      segment: string;
      isLastSegment: boolean;
      nextSegment: string | null;
      currentIndex: number;
      nextIndex: number | null;
    }) => {
      if (typingMode !== "manual") {
        return false;
      }

      upcomingExampleSegmentRef.current = null;
      upcomingExampleIndexRef.current = null;

      if (isLastSegment) {
        return false;
      }

      if (!nextSegment) {
        return false;
      }

      const upcomingExample = nextSegment.match(/```(\w+)?\s*\n([\s\S]*?)```/);
      if (!upcomingExample) {
        return false;
      }

      const holdKey = `${segment}:::${nextSegment}`;
      if (
        !manualHoldActiveRef.current &&
        lastManualHoldKeyRef.current === holdKey
      ) {
        return false;
      }

      if (skipHoldKeyRef.current === holdKey) {
        skipHoldKeyRef.current = null;
        return false;
      }

      if (continuePromptTimerRef.current) {
        clearTimeout(continuePromptTimerRef.current);
        continuePromptTimerRef.current = null;
      }

      pendingExampleRef.current = {
        language: (upcomingExample[1] || "example").toLowerCase(),
        code: upcomingExample[2].trim(),
      };
      upcomingExampleSegmentRef.current = nextSegment;
      upcomingExampleIndexRef.current = nextIndex ?? null;

      lastManualHoldKeyRef.current = holdKey;
      manualHoldActiveRef.current = true;
      setManualHoldDisplay(segment);
      setIsManualHoldActive(true);
      setShowContinuePrompt(false);
      if (!isExamplePinnedRef.current) {
        setActiveExample(null);
      }

      const holdDelay = Math.max(600, getSegmentDelay(segment) ?? 2000);
      continuePromptTimerRef.current = window.setTimeout(() => {
        if (!manualHoldActiveRef.current) {
          pendingExampleRef.current = null;
          continuePromptTimerRef.current = null;
          return;
        }

        window.requestAnimationFrame(() => {
          if (!manualHoldActiveRef.current) {
            pendingExampleRef.current = null;
            continuePromptTimerRef.current = null;
            return;
          }
          if (pendingExampleRef.current && !isExamplePinnedRef.current) {
            setActiveExample(pendingExampleRef.current);
          }
          setManualHoldDisplay("");
          setShowContinuePrompt(true);
          pendingExampleRef.current = null;
          continuePromptTimerRef.current = null;
        });
      }, holdDelay);

      return true;
    },
    [typingMode, getSegmentDelay]
  );

  const handleSegmentStart = useCallback(
    (segment: string) => {
      if (manualHoldDisplay !== undefined) {
        setManualHoldDisplay(undefined);
      }
      lastManualHoldKeyRef.current = null;
      if (segment === upcomingExampleSegmentRef.current) {
        upcomingExampleSegmentRef.current = null;
        upcomingExampleIndexRef.current = null;
      }

      const match = segment.match(/```(\w+)?\s*\n([\s\S]*?)```/);
      if (match) {
        setIsExamplePinned(false);
        setActiveExample({
          language: (match[1] || "example").toLowerCase(),
          code: match[2].trim(),
        });
      }
    },
    [manualHoldDisplay]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === "Space" &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        event.preventDefault();

        if (videoPlayerRef.current) {
          if (isVideoPlaying) {
            videoPlayerRef.current.pause();
            setIsMessageBarVisible(true);
          } else {
            videoPlayerRef.current.play();
            setIsMessageBarVisible(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVideoPlaying]);

  useEffect(() => {
    const event = new CustomEvent("thinkingStateChange", {
      detail: { isThinking },
    });
    window.dispatchEvent(event);
  }, [isThinking]);

  useEffect(() => {
    const handleTypingStop = () => {
      stopTypingManually();
    };

    window.addEventListener("typingStop", handleTypingStop);
    return () => {
      window.removeEventListener("typingStop", handleTypingStop);
    };
  }, [stopTypingManually]);

  const switchToAuto = useCallback(() => {
    if (typingModeRef.current === "auto") {
      return;
    }

    if (continuePromptTimerRef.current) {
      clearTimeout(continuePromptTimerRef.current);
      continuePromptTimerRef.current = null;
    }

    const pendingExample = pendingExampleRef.current;
    pendingExampleRef.current = null;

    manualHoldActiveRef.current = false;
    setIsManualHoldActive(false);
    setShowContinuePrompt(false);
    setManualHoldDisplay(undefined);
    lastManualHoldKeyRef.current = null;
    skipHoldKeyRef.current = null;
    upcomingExampleSegmentRef.current = null;
    upcomingExampleIndexRef.current = null;

    if (pendingExample && !isExamplePinnedRef.current) {
      setActiveExample(pendingExample);
    }

    setTypingMode("auto");
    typingModeRef.current = "auto";
    emitResumeSignal();
  }, [
    typingModeRef,
    continuePromptTimerRef,
    pendingExampleRef,
    manualHoldActiveRef,
    isExamplePinnedRef,
    setIsManualHoldActive,
    setShowContinuePrompt,
    setManualHoldDisplay,
    setActiveExample,
    setTypingMode,
    emitResumeSignal,
  ]);

  const switchToManual = useCallback(() => {
    if (typingModeRef.current === "manual") {
      return;
    }

    if (continuePromptTimerRef.current) {
      clearTimeout(continuePromptTimerRef.current);
      continuePromptTimerRef.current = null;
    }

    pendingExampleRef.current = null;
    manualHoldActiveRef.current = false;
    setIsManualHoldActive(false);
    setShowContinuePrompt(false);
    setManualHoldDisplay(undefined);
    lastManualHoldKeyRef.current = null;
    skipHoldKeyRef.current = null;
    upcomingExampleSegmentRef.current = null;
    upcomingExampleIndexRef.current = null;

    setIsExamplePinned(false);
    isExamplePinnedRef.current = false;
    setTypingMode("manual");
    typingModeRef.current = "manual";
  }, [
    typingModeRef,
    continuePromptTimerRef,
    pendingExampleRef,
    manualHoldActiveRef,
    isExamplePinnedRef,
    setIsExamplePinned,
    setIsManualHoldActive,
    setShowContinuePrompt,
    setManualHoldDisplay,
    setTypingMode,
  ]);

  useEffect(() => {
    const handleTypingSettingsChange = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          speed: number;
          delay: number;
          mode?: "auto" | "manual";
        }>
      ).detail;
      if (!detail) return;

      const nextSpeed =
        Number.isFinite(detail.speed) && detail.speed > 0 ? detail.speed : 1;
      const nextDelay =
        Number.isFinite(detail.delay) && detail.delay > 0 ? detail.delay : 1;
      const requestedMode = detail.mode;

      setTypingSpeed(nextSpeed);
      setDelayMultiplier(nextDelay);
      if (requestedMode === "manual") {
        switchToManual();
      } else if (requestedMode === "auto") {
        switchToAuto();
      }
    };

    window.addEventListener(
      "typingSettingsChange",
      handleTypingSettingsChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "typingSettingsChange",
        handleTypingSettingsChange as EventListener
      );
  }, [switchToAuto, switchToManual]);

  useEffect(() => {
    return () => {
      if (continuePromptTimerRef.current) {
        clearTimeout(continuePromptTimerRef.current);
        continuePromptTimerRef.current = null;
      }
      pendingExampleRef.current = null;
      manualHoldActiveRef.current = false;
      lastManualHoldKeyRef.current = null;
      skipHoldKeyRef.current = null;
      upcomingExampleSegmentRef.current = null;
      upcomingExampleIndexRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeExample || !isExamplePinned) {
      setIsExampleHovered(false);
    }
  }, [activeExample, isExamplePinned]);

  useEffect(() => {
    isExamplePinnedRef.current = isExamplePinned;
  }, [isExamplePinned]);

  useEffect(() => {
    typingModeRef.current = typingMode;
  }, [typingMode]);

  useEffect(() => {
    if (!isManualHoldActive) {
      manualHoldActiveRef.current = false;
    }
  }, [isManualHoldActive]);

  const charDelay = useMemo(() => {
    const safeSpeed = Math.max(typingSpeed, 0.1);
    return Math.max(10, 50 / safeSpeed);
  }, [typingSpeed]);

  const typingPaused =
    (typingMode === "auto" ? isExampleHovered : false) || isExamplePinned;

  useEffect(() => {
    // Reset manual hold whenever a new response arrives
    if (continuePromptTimerRef.current) {
      clearTimeout(continuePromptTimerRef.current);
      continuePromptTimerRef.current = null;
    }
    pendingExampleRef.current = null;
    manualHoldActiveRef.current = false;
    setIsExamplePinned(false);
    setActiveExample(null);
    setIsManualHoldActive(false);
    setShowContinuePrompt(false);
    setManualHoldDisplay(undefined);
    lastManualHoldKeyRef.current = null;
    skipHoldKeyRef.current = null;
    upcomingExampleSegmentRef.current = null;
    upcomingExampleIndexRef.current = null;
    emitResumeSignal();
  }, [apiResponse, emitResumeSignal]);

  return (
    <div className="min-h-screen flex flex-col items-center pt-7 px-0 sm:px-6 lg:px-8">
      <div className="relative flex items-center justify-center w-full h-[70px]">
        <TypingMessage
          inputString={apiResponse}
          onComplete={handleTypingComplete}
          onSegmentStart={handleSegmentStart}
          onSegmentComplete={handleSegmentComplete}
          getSegmentDelay={getSegmentDelay}
          isPaused={typingPaused}
          isPinned={isExamplePinned}
          charDelay={charDelay}
          resumeSignal={resumeSignal}
          holdDisplay={manualHoldDisplay}
        />
        {showContinuePrompt && typingMode === "manual" && (
          <div className="absolute inset-0 flex items-center justify-center animate-continue-fade-in">
            <button
              type="button"
              className="rounded-full bg-purple-600/80 px-5 py-2 text-sm font-semibold text-white shadow-lg opacity-50 transition hover:bg-purple-600 focus:opacity-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onClick={() => {
                if (continuePromptTimerRef.current) {
                  clearTimeout(continuePromptTimerRef.current);
                  continuePromptTimerRef.current = null;
                }
                pendingExampleRef.current = null;
                manualHoldActiveRef.current = false;
                setIsManualHoldActive(false);
                setShowContinuePrompt(false);
                setManualHoldDisplay(undefined);
                skipHoldKeyRef.current = lastManualHoldKeyRef.current;
                const exampleIndex = upcomingExampleIndexRef.current;
                upcomingExampleSegmentRef.current = null;
                upcomingExampleIndexRef.current = null;
                if (exampleIndex !== null && exampleIndex !== undefined) {
                  emitResumeSignal(exampleIndex + 1);
                } else {
                  emitResumeSignal();
                }
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center items-center w-full">
        <div className="w-full max-w-[88.8889rem] aspect-video relative">
          <div className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,0,0)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <PurpleVideoPlayer
              ref={videoPlayerRef}
              onPlayStateChange={handlePlayStateChange}
            />
          </div>
          {activeExample && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={`pointer-events-auto w-[min(90%,40rem)] max-h-[78%] overflow-hidden rounded-2xl border ${
                  isExampleHovered
                    ? "border-purple-500/70 shadow-[0_0_45px_rgba(168,85,247,0.55)]"
                    : "border-slate-700/60 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)]"
                } bg-slate-950/95 text-slate-100 transition-all duration-200 animate-example-card`}
                onMouseEnter={() => setIsExampleHovered(true)}
                onMouseLeave={() => {
                  setIsExampleHovered(false);
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                    <span className="tracking-[0.16em] text-slate-300">
                      {activeExample.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                    {typingMode === "auto" && (
                      <button
                        type="button"
                        className={`rounded-full px-2 py-1 font-semibold transition-all ${
                          isExamplePinned
                            ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                            : "bg-slate-800/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                        }`}
                        onClick={() => setIsExamplePinned((prev) => !prev)}
                      >
                        {isExamplePinned ? "Pinned" : "Pin"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 font-semibold transition-all bg-slate-800/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            activeExample.code
                          );
                        } catch (error) {
                          console.error("Failed to copy code", error);
                        }
                      }}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-2 py-1 font-semibold transition-all ${
                        typingMode === "auto"
                          ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                          : "bg-slate-800/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                      }`}
                      onClick={() => {
                        if (typingMode === "auto") {
                          switchToManual();
                        } else {
                          switchToAuto();
                        }
                      }}
                      aria-pressed={typingMode === "auto"}
                    >
                      Auto
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950/90 px-5 py-4">
                  <HighlightedCode
                    language={activeExample.language}
                    code={activeExample.code}
                  />
                </div>
              </div>
            </div>
          )}
          <MessageBar
            isVisible={isMessageBarVisible}
            setIsVisible={setIsMessageBarVisible}
            remainingMessages={remainingMessages}
            onMessageSent={handleMessageSent}
            disabled={isTypingInProgress}
            refocusSignal={refocusCounter}
          />
        </div>
      </div>
      <HistoryWindow history={conversationHistory} />
      {(isMobile || isTablet) && <MessageButton onClick={toggleMessageBar} />}
    </div>
  );
}
