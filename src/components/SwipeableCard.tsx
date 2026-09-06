"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type SwipeDirection = "left" | "right";

export interface SwipeableCardHandle {
  swipe: (direction: SwipeDirection) => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Horizontal distance in px that triggers a swipe on release. */
  threshold?: number;
  /** Disables drag interactions. */
  disabled?: boolean;
  onSwiping?: (offsetX: number, offsetY: number) => void;
  /** Called once the card has finished flying out of the viewport. */
  onSwiped?: (direction: SwipeDirection) => void;
  onSwipeStart?: () => void;
  /** Called when the drag ends but did not cross the swipe threshold. */
  onSwipeCancel?: () => void;
}

const DEFAULT_THRESHOLD = 90;
const EXIT_MS = 380;

export const SwipeableCard = forwardRef<
  SwipeableCardHandle,
  SwipeableCardProps
>(function SwipeableCard(
  {
    children,
    className = "",
    style,
    threshold = DEFAULT_THRESHOLD,
    disabled = false,
    onSwiping,
    onSwiped,
    onSwipeStart,
    onSwipeCancel,
  },
  ref
) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<SwipeDirection | null>(null);

  const offsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const triggerExit = useCallback(
    (direction: SwipeDirection) => {
      if (exiting) return;
      setExiting(direction);
      setDragging(false);
      if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = window.setTimeout(() => {
        onSwiped?.(direction);
      }, EXIT_MS);
    },
    [exiting, onSwiped]
  );

  useImperativeHandle(
    ref,
    () => ({
      swipe: (direction) => triggerExit(direction),
    }),
    [triggerExit]
  );

  function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest("button, a, input, textarea, select, video, [data-no-swipe]")
    );
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || exiting || isInteractiveTarget(e.target)) return;
    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    onSwipeStart?.();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId)
      return;
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    offsetRef.current = { x, y };
    setOffset({ x, y });
    onSwiping?.(x, y);
  }

  function handlePointerEnd() {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    setDragging(false);

    const { x } = offsetRef.current;
    if (x > threshold) {
      triggerExit("right");
    } else if (x < -threshold) {
      triggerExit("left");
    } else {
      offsetRef.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
      onSwipeCancel?.();
    }
  }

  const rotate = exiting
    ? exiting === "right"
      ? 28
      : -28
    : Math.max(-16, Math.min(16, offset.x / 14));

  const transform = exiting
    ? `translate3d(${exiting === "right" ? "130vw" : "-130vw"}, ${
        offset.y
      }px, 0) rotate(${rotate}deg)`
    : `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotate}deg)`;

  const transition = dragging
    ? "none"
    : exiting
    ? `transform ${EXIT_MS}ms cubic-bezier(0.2, 0.6, 0.3, 1), opacity ${EXIT_MS}ms ease`
    : "transform 0.3s cubic-bezier(0.2, 0.7, 0.3, 1), opacity 0.3s ease";

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={className}
      style={{
        ...style,
        transform,
        transition,
        opacity: exiting ? 0 : 1,
        willChange: "transform",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
});