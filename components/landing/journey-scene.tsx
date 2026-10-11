"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";

import { NexaGlyph } from "@/components/brand/nexa-logo";
import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

import { JourneyDetail } from "./journey-detail";
import {
  ChatBubbleIcon,
  DashboardGridIcon,
  VideoPlayerIcon,
} from "./journey-icons";
import { ScenePill } from "./scene-pill";
import {
  JOURNEY_STEPS,
  SCENE_NODES,
  nodeTopPercent,
  type SceneNodeId,
} from "./journey-steps";
import "./journey-scene.css";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    () => false,
  );
}

const SPOKES: SceneNodeId[] = ["tt", "wa", "db"];

export function JourneyScene() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const manualPauseRef = useRef(false);
  const inViewRef = useRef(false);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [runId, setRunId] = useState(0);

  const step = JOURNEY_STEPS[current];

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseInternal = useCallback(() => {
    if (pausedRef.current) {
      return;
    }
    pausedRef.current = true;
    if (timerRef.current != null) {
      const elapsed = Date.now() - startedAtRef.current;
      const total = remainingRef.current ?? JOURNEY_STEPS[current].duration;
      remainingRef.current = Math.max(0, total - elapsed);
      clearTimer();
    }
    setPaused(true);
  }, [clearTimer, current]);

  const resumeInternal = useCallback(() => {
    if (manualPauseRef.current || reduceMotion) {
      return;
    }
    if (!pausedRef.current) {
      return;
    }
    pausedRef.current = false;
    setPaused(false);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      manualPauseRef.current = true;
      pauseInternal();
    }
  }, [pauseInternal, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || paused) {
      return;
    }
    const ms = remainingRef.current ?? JOURNEY_STEPS[current].duration;
    startedAtRef.current = Date.now();
    remainingRef.current = ms;
    timerRef.current = window.setTimeout(() => {
      remainingRef.current = null;
      setCurrent((index) => (index + 1) % JOURNEY_STEPS.length);
    }, ms);
    return clearTimer;
  }, [clearTimer, current, paused, reduceMotion, runId]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (manualPauseRef.current || reduceMotion) {
          return;
        }
        if (entry.isIntersecting) {
          resumeInternal();
        } else {
          pauseInternal();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [pauseInternal, reduceMotion, resumeInternal]);

  useEffect(() => {
    function onVisibility() {
      if (manualPauseRef.current || reduceMotion) {
        return;
      }
      if (document.visibilityState === "hidden") {
        pauseInternal();
      } else if (inViewRef.current) {
        resumeInternal();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pauseInternal, reduceMotion, resumeInternal]);

  useEffect(() => {
    const row = chipsRef.current;
    const chip = chipRefs.current[current];
    if (!row || !chip) {
      return;
    }
    row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
  }, [current]);

  function goTo(index: number) {
    remainingRef.current = null;
    setCurrent(index);
    setRunId((id) => id + 1);
  }

  function togglePause() {
    if (pausedRef.current) {
      manualPauseRef.current = false;
      resumeInternal();
    } else {
      manualPauseRef.current = true;
      pauseInternal();
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "journey-scene rounded-[20px] border border-zinc-200/80 bg-white p-4 shadow-card sm:p-5",
        paused && "paused",
        reduceMotion && "reduce-motion",
      )}
    >
      <ol className="sr-only">
        {JOURNEY_STEPS.map((item) => (
          <li key={item.label}>
            {item.captionTitle} {item.captionText}
          </li>
        ))}
      </ol>

      <div ref={chipsRef} className="journey-chips">
        {JOURNEY_STEPS.map((item, index) => {
          const selected = index === current;
          return (
            <button
              key={item.label}
              ref={(node) => {
                chipRefs.current[index] = node;
              }}
              type="button"
              aria-current={selected ? "step" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "relative min-h-11 shrink-0 overflow-hidden rounded-control px-2.5 py-2 text-[12.5px] font-medium",
                "whitespace-nowrap",
                focusRingClass,
                selected
                  ? "bg-accent text-white"
                  : "bg-accent-soft text-accent-text",
              )}
            >
              {index + 1}. {item.label}
              {selected && !reduceMotion ? (
                <span
                  key={runId}
                  className="journey-progress"
                  style={{ "--dur": `${item.duration}ms` } as CSSProperties}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="relative mx-auto mt-3 mb-3 w-full max-w-[460px] overflow-visible rounded-2xl"
        style={{
          aspectRatio: "100 / 90",
          background:
            "radial-gradient(55% 60% at 50% 55%, #fff 0%, var(--color-accent-soft) 100%)",
        }}
      >
        <svg
          viewBox="0 0 100 90"
          preserveAspectRatio="none"
          overflow="visible"
          className="absolute inset-0 size-full"
        >
          <circle
            className="journey-ring"
            cx="50"
            cy="45"
            r="33"
            fill="none"
            stroke="#c9ced4"
            strokeWidth="1.5"
            strokeDasharray="1 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {SPOKES.map((id) => {
            const node = SCENE_NODES[id];
            const active = step.flows.some(
              (flow) => flow.from === id || flow.to === id,
            );
            return (
              <line
                key={id}
                x1="50"
                y1="45"
                x2={node.x}
                y2={node.y}
                stroke={active ? "var(--color-accent)" : "#d5d9de"}
                strokeWidth="1.5"
                strokeDasharray={active ? undefined : "4 5"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {!reduceMotion ? (
            <g className="journey-orbiter">
              <circle
                cx="50"
                cy="12"
                r="1.4"
                fill="var(--color-accent)"
                opacity="0.55"
              />
            </g>
          ) : null}
        </svg>

        <div key={`${current}-${runId}`} className="absolute inset-0">
          {!reduceMotion
            ? step.flows.map((flow, flowIndex) => {
                const from = SCENE_NODES[flow.from];
                const to = SCENE_NODES[flow.to];
                return [0, 1].map((dot) => (
                  <span
                    key={`${flow.from}-${flow.to}-${dot}`}
                    className={cn(
                      "journey-particle",
                      flow.tone === "success" && "journey-particle-success",
                    )}
                    style={
                      {
                        "--x1": `${from.x}%`,
                        "--y1": `${nodeTopPercent(from.y)}%`,
                        "--x2": `${to.x}%`,
                        "--y2": `${nodeTopPercent(to.y)}%`,
                        animationDelay: `${dot * -0.85 + flowIndex * -0.4}s`,
                      } as CSSProperties
                    }
                  />
                ));
              })
            : null}
        </div>

        <SceneNode
          id="tt"
          active={step.activeNodes.includes("tt")}
          label={
            <NodeCaption
              title="TikTok"
              pill={<ScenePill tone="warning">Bientôt</ScenePill>}
              side="right"
            />
          }
        >
          <span className="flex size-full items-center justify-center rounded-full bg-zinc-900 text-white shadow-card">
            <VideoPlayerIcon className="size-[26px] max-[479px]:size-[22px]" />
          </span>
        </SceneNode>
        <SceneNode
          id="wa"
          active={step.activeNodes.includes("wa")}
          label={
            <NodeCaption
              title="WhatsApp"
              pill={<ScenePill tone="success">Disponible</ScenePill>}
              side="bottom"
            />
          }
        >
          <span className="flex size-full items-center justify-center rounded-full bg-success text-white shadow-card">
            <ChatBubbleIcon className="size-[26px] max-[479px]:size-[22px]" />
          </span>
        </SceneNode>
        <SceneNode
          id="db"
          active={step.activeNodes.includes("db")}
          label={
            <NodeCaption title={"Votre tableau\nde bord"} side="bottom" />
          }
        >
          <span className="flex size-full items-center justify-center rounded-full border border-zinc-200 bg-white text-accent-text shadow-card">
            <DashboardGridIcon className="size-[26px] max-[479px]:size-[22px]" />
          </span>
        </SceneNode>
        <SceneNode
          id="hub"
          hub
          active={step.activeNodes.includes("hub")}
          label={
            <div className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 text-center">
              <p className="text-[12.5px] font-semibold text-zinc-900">Nexa</p>
              <p className="hidden text-[11px] text-zinc-500 min-[480px]:block">
                l&apos;agent de la boutique
              </p>
            </div>
          }
        >
          <span className="relative flex size-full items-center justify-center rounded-full bg-accent text-white shadow-card-hover">
            {!reduceMotion ? (
              <>
                <span className="journey-hub-ping" />
                <span className="journey-hub-ping journey-hub-ping-delay" />
              </>
            ) : null}
            <NexaGlyph className="relative size-[58%]" />
          </span>
        </SceneNode>
      </div>

      <div className="mt-3.5 grid" aria-live="off">
        {JOURNEY_STEPS.map((item, index) => {
          const visible = index === current;
          return (
            <div
              key={item.label}
              className={cn(
                "col-start-1 row-start-1",
                !visible && "invisible pointer-events-none",
              )}
              aria-hidden={visible ? undefined : true}
            >
              <p className="font-display text-[17px] font-bold text-zinc-900">
                {item.captionTitle}
              </p>
              <p className="mt-1 text-[15px] text-zinc-500">{item.captionText}</p>
            </div>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="mt-1 grid overflow-hidden rounded-[14px] border border-zinc-200/80 bg-background p-3"
      >
        {JOURNEY_STEPS.map((item, index) => (
          <div
            key={item.label}
            className="col-start-1 row-start-1 invisible pointer-events-none"
          >
            <JourneyDetail step={index} reduceMotion reserveTyping />
          </div>
        ))}
        <div
          key={`${current}-${runId}`}
          className="col-start-1 row-start-1"
        >
          <JourneyDetail step={current} reduceMotion={reduceMotion} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {reduceMotion ? null : (
          <button
            type="button"
            onClick={togglePause}
            aria-label={
              paused ? "Relancer l'animation" : "Mettre l'animation en pause"
            }
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700",
              focusRingClass,
            )}
          >
            {paused ? (
              <Play className="size-4" aria-hidden="true" />
            ) : (
              <Pause className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
        <p className="text-[12.5px] text-zinc-500">
          Illustration avec des données fictives.
        </p>
      </div>
    </div>
  );
}

function SceneNode({
  id,
  hub,
  active,
  label,
  children,
}: {
  id: SceneNodeId;
  hub?: boolean;
  active: boolean;
  label: ReactNode;
  children: ReactNode;
}) {
  const node = SCENE_NODES[id];
  const ring =
    id === "wa"
      ? "0 0 0 5px rgb(13 138 95 / 0.16)"
      : id === "tt"
        ? "0 0 0 5px rgb(24 24 27 / 0.14)"
        : "0 0 0 5px rgb(75 85 99 / 0.12)";
  const outline =
    id === "wa"
      ? "var(--color-success)"
      : id === "tt"
        ? "#18181b"
        : "var(--color-accent)";
  return (
    <div
      className="absolute z-[1]"
      style={{
        left: `${node.x}%`,
        top: `${nodeTopPercent(node.y)}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "relative",
          "transition-[transform,box-shadow] duration-300 ease-out",
          hub ? "journey-hub-disc" : "journey-node-disc",
          active && "scale-110",
        )}
        style={
          active
            ? {
                boxShadow: `${ring}, 0 1px 2px rgb(20 20 43 / 0.06)`,
                borderRadius: "999px",
                outline: `1.5px solid ${outline}`,
                outlineOffset: "0px",
              }
            : undefined
        }
      >
        {children}
        {label}
      </div>
    </div>
  );
}

function NodeCaption({
  title,
  pill,
  side,
}: {
  title: string;
  pill?: ReactNode;
  side: "right" | "bottom";
}) {
  return (
    <div
      className={cn(
        "pointer-events-none z-[2] whitespace-nowrap",
        side === "right"
          ? "absolute top-1/2 left-full ml-2.5 -translate-y-1/2 text-left"
          : "absolute top-full left-1/2 mt-1.5 -translate-x-1/2 text-center",
      )}
    >
      <p className="text-[12.5px] font-semibold whitespace-pre text-zinc-900">
        {title}
      </p>
      {pill ? (
        <div
          className={cn(
            "mt-0.5 flex",
            side === "right" ? "justify-start" : "justify-center",
          )}
        >
          {pill}
        </div>
      ) : null}
    </div>
  );
}
