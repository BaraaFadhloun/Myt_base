"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface ResumeSignalPayload {
  key: number;
  skipToIndex?: number;
}

interface TypingMessageProps {
  inputString?: string;
  onComplete?: () => void;
  onSegmentStart?: (segment: string) => void;
  getSegmentDelay?: (segment: string) => number;
  isPaused?: boolean;
  charDelay?: number;
  onSegmentComplete?: (info: {
    segment: string;
    isLastSegment: boolean;
    nextSegment: string | null;
    currentIndex: number;
    nextIndex: number | null;
  }) => boolean;
  resumeSignal?: ResumeSignalPayload | null;
  holdDisplay?: string;
  isPinned?: boolean;
}

const TypingMessage = ({
  inputString,
  onComplete,
  onSegmentStart,
  getSegmentDelay,
  isPaused = false,
  charDelay = 50,
  onSegmentComplete,
  resumeSignal = null,
  holdDisplay,
  isPinned = false,
}: TypingMessageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const typingStateRef = useRef<{
    visibleMessage: string;
    fullMessage: string;
    index: number;
  } | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [animationComplete, setAnimationComplete] = useState(false);
  const lastSegmentRef = useRef<string | null>(null);
  const pausedRef = useRef<boolean>(isPaused || isPinned);
  const charDelayRef = useRef(Math.max(10, charDelay));
  const heldAdvanceRef = useRef<(() => void) | null>(null);
  const heldVisibleMessageRef = useRef<string | null>(null);
  const lastResumeSignalKeyRef = useRef<number | null>(null);

  const messages = useMemo(() => {
    if (!inputString) {
      return [];
    }

    const segments: string[] = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let lastIndex = 0;

    const pushTextSegments = (text: string) => {
      text
        .split(/\n\s*\n/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0)
        .forEach((segment) => segments.push(segment));
    };

    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(inputString)) !== null) {
      const precedingText = inputString.slice(lastIndex, match.index);
      if (precedingText) {
        pushTextSegments(precedingText);
      }

      segments.push(match[0].trim());
      lastIndex = match.index + match[0].length;
    }

    const remainingText = inputString.slice(lastIndex);
    if (remainingText) {
      pushTextSegments(remainingText);
    }

    return segments;
  }, [inputString]);

  const clearTypingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const clearScheduledTimeouts = () => {
    if (timeoutRefs.current.length) {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current = [];
    }
  };

  const scheduleTimeout = (callback: () => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const wrappedCallback = () => {
      timeoutRefs.current = timeoutRefs.current.filter(
        (id) => id !== timeoutId
      );

      if (pausedRef.current) {
        timeoutId = setTimeout(wrappedCallback, 100);
        timeoutRefs.current.push(timeoutId);
        return;
      }

      callback();
    };

    timeoutId = setTimeout(wrappedCallback, delay);

    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  const adjustFontSize = (message: string) => {
    if (!message || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    let testSize = 23;

    const isSmallScreen = containerWidth < 500;

    let processedMessage = message;
    if (isSmallScreen) {
      const words = message.split(" ");
      const middle = Math.ceil(words.length / 2);
      processedMessage =
        words.slice(0, middle).join(" ") + "\n" + words.slice(middle).join(" ");
    }

    const testElement = document.createElement("span");
    testElement.style.position = "absolute";
    testElement.style.whiteSpace = "pre-wrap";
    testElement.style.visibility = "hidden";
    testElement.style.fontSize = `${testSize}px`;
    testElement.textContent = processedMessage;
    document.body.appendChild(testElement);

    while (testSize > 5) {
      testElement.style.fontSize = `${testSize}px`;
      const testElementWidth = testElement.offsetWidth;
      const testElementHeight = testElement.offsetHeight;

      if (
        testElementWidth <= containerWidth &&
        testElementHeight <= containerHeight
      ) {
        break;
      }

      testSize -= 0.4;
    }

    setFontSize(testSize);
    document.body.removeChild(testElement);
  };

  const stepForward = () => {
    const state = typingStateRef.current;
    if (!state) {
      return;
    }

    if (pausedRef.current) {
      return;
    }

    const nextIndex = state.index + 1;
    const nextVisible = state.visibleMessage.substring(0, nextIndex);
    setDisplayedMessage(nextVisible);
    state.index = nextIndex;

    if (nextIndex >= state.visibleMessage.length) {
      typingStateRef.current = null;
      clearTypingInterval();

      const isLastSegment = currentMessageIndex >= messages.length - 1;
      const nextSegment = !isLastSegment
        ? messages[currentMessageIndex + 1] ?? null
        : null;
      const shouldHold = onSegmentComplete?.({
        segment: state.fullMessage,
        isLastSegment,
        nextSegment,
        currentIndex: currentMessageIndex,
        nextIndex: !isLastSegment ? currentMessageIndex + 1 : null,
      });

      const advance = () => {
        if (currentMessageIndex >= messages.length - 1) {
          setAnimationComplete(true);

          scheduleTimeout(() => {
            setDisplayedMessage("");
          }, 1000);

          if (onComplete) {
            onComplete();
          }
        } else {
          setCurrentMessageIndex((prevIndex) => prevIndex + 1);
        }
      };

      if (shouldHold) {
        heldVisibleMessageRef.current = state.visibleMessage;
        pausedRef.current = true;
        heldAdvanceRef.current = () => {
          heldAdvanceRef.current = null;
          pausedRef.current = false;
          heldVisibleMessageRef.current = null;
          advance();
        };
      } else {
        const delay = getSegmentDelay?.(state.fullMessage) ?? 2000;
        scheduleTimeout(advance, delay);
      }
    }
  };

  const initializeInterval = (runImmediately: boolean) => {
    clearTypingInterval();
    if (!typingStateRef.current) return;

    if (runImmediately) {
      stepForward();
    }

    intervalRef.current = setInterval(() => {
      stepForward();
    }, Math.max(10, charDelayRef.current));
  };

  const typeMessage = (message: string, fullMessage: string) => {
    if (!message) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRefs.current.length) {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current = [];
    }
    heldVisibleMessageRef.current = null;

    typingStateRef.current = { visibleMessage: message, fullMessage, index: 0 };
    setDisplayedMessage("");
    initializeInterval(true);
  };

  useEffect(() => {
    if (inputString) {
      clearTypingInterval();
      clearScheduledTimeouts();
      setCurrentMessageIndex(0);
      setAnimationComplete(false);
      setDisplayedMessage("");
      lastSegmentRef.current = null;
      lastResumeSignalKeyRef.current = null;
    }
  }, [inputString]);

  useEffect(() => {
    if (
      messages &&
      messages.length > 0 &&
      currentMessageIndex < messages.length &&
      !animationComplete
    ) {
      const currentMessage = messages[currentMessageIndex];
      if (!currentMessage) return;

      if (lastSegmentRef.current !== currentMessage) {
        onSegmentStart?.(currentMessage);
        lastSegmentRef.current = currentMessage;
      }

      const visibleContent = currentMessage
        .replace(/```[\s\S]*?```/g, "")
        .trim();

      if (visibleContent) {
        adjustFontSize(visibleContent);
        typeMessage(visibleContent, currentMessage);
      } else {
        setDisplayedMessage("");
        const delay = getSegmentDelay?.(currentMessage) ?? 600;
        const isLastSegment = currentMessageIndex >= messages.length - 1;
        const nextSegment = !isLastSegment
          ? messages[currentMessageIndex + 1] ?? null
          : null;
        const shouldHold = onSegmentComplete?.({
          segment: currentMessage,
          isLastSegment,
          nextSegment,
          currentIndex: currentMessageIndex,
          nextIndex: !isLastSegment ? currentMessageIndex + 1 : null,
        });

        const advance = () => {
          if (currentMessageIndex >= messages.length - 1) {
            setAnimationComplete(true);

            scheduleTimeout(() => {
              setDisplayedMessage("");
            }, 1000);

            if (onComplete) {
              onComplete();
            }
          } else {
            setCurrentMessageIndex((prevIndex) => prevIndex + 1);
          }
        };

        if (shouldHold) {
          heldVisibleMessageRef.current = currentMessage;
          pausedRef.current = true;
          heldAdvanceRef.current = () => {
            heldAdvanceRef.current = null;
            pausedRef.current = false;
            heldVisibleMessageRef.current = null;
            advance();
          };
        } else {
          scheduleTimeout(advance, delay);
        }
      }
    }
  }, [
    currentMessageIndex,
    messages,
    animationComplete,
    onComplete,
    onSegmentStart,
    onSegmentComplete,
    getSegmentDelay,
  ]);

  useEffect(() => {
    const nextPaused = isPaused || isPinned;
    const wasPaused = pausedRef.current;
    pausedRef.current = nextPaused;

    if (nextPaused) {
      if (!wasPaused) {
        clearTypingInterval();
        setDisplayedMessage("");
        if (typingStateRef.current) {
          typingStateRef.current.index = 0;
        }
      }
    } else if (wasPaused) {
      if (typingStateRef.current) {
        const shouldRunImmediately = typingStateRef.current.index > 0;
        initializeInterval(shouldRunImmediately);
      }
    }
  }, [isPaused, isPinned]);

  useEffect(() => {
    charDelayRef.current = Math.max(10, charDelay);
    if (typingStateRef.current && !pausedRef.current) {
      initializeInterval(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charDelay]);

  useEffect(() => {
    return () => {
      clearTypingInterval();
      clearScheduledTimeouts();
    };
  }, []);

useEffect(() => {
  if (!resumeSignal) {
    return;
  }

  if (lastResumeSignalKeyRef.current === resumeSignal.key) {
    return;
  }

  lastResumeSignalKeyRef.current = resumeSignal.key;

  setDisplayedMessage("");
  heldVisibleMessageRef.current = null;

  const skipIndex = resumeSignal.skipToIndex;
  const hasSkipTarget =
    typeof skipIndex === "number" && Number.isFinite(skipIndex);

  if (hasSkipTarget) {
    const desiredIndex = Math.trunc(skipIndex);

    clearTypingInterval();
    clearScheduledTimeouts();
    typingStateRef.current = null;
    heldAdvanceRef.current = null;
    pausedRef.current = false;

    if (messages.length === 0 || desiredIndex >= messages.length) {
      setAnimationComplete(true);
      setDisplayedMessage("");
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const targetIndex = Math.max(0, desiredIndex);

    setCurrentMessageIndex(targetIndex);
    return;
  }

  if (heldAdvanceRef.current) {
    const resolver = heldAdvanceRef.current;
    heldAdvanceRef.current = null;
    pausedRef.current = false;
    resolver();
  }
}, [resumeSignal, messages, onComplete]);

  if (!inputString) {
    return null;
  }

  return (
    <div
      className="w-full mx-auto mb-3 p-4"
      ref={containerRef}
      style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: `${fontSize}px`,
          whiteSpace: "pre-wrap",
          textAlign: "center",
        }}
        className="text-purple-800 dark:text-purple-200 font-semibold"
      >
        {holdDisplay !== undefined
          ? holdDisplay
          : heldVisibleMessageRef.current ?? displayedMessage}
      </h2>
    </div>
  );
};

export default TypingMessage;
