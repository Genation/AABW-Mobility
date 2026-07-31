"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TripPlan, TripAdvisorWarning } from "./types";
import { analyzeFullTrip } from "./advisor-full-trip-mock";

const ANALYSIS_DELAY_MIN_MS = 2000;
const ANALYSIS_DELAY_MAX_MS = 4000;
const TOAST_DURATION_MS = 4500;

export function useDrivoAdvisor() {
  const [messages, setMessages] = useState<TripAdvisorWarning[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_DURATION_MS);
  }, []);

  const runAnalysis = useCallback((plan: TripPlan) => {
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    setThinking(true);
    const delay = ANALYSIS_DELAY_MIN_MS + Math.random() * (ANALYSIS_DELAY_MAX_MS - ANALYSIS_DELAY_MIN_MS);
    analysisTimerRef.current = setTimeout(() => {
      const warnings = analyzeFullTrip(plan);
      setThinking(false);
      setMessages(warnings);
      setUnread(warnings.length);
      if (warnings.length > 0) showToast();
    }, delay);
  }, [showToast]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setUnread(0);
        setToastVisible(false);
      }
      return !prev;
    });
  }, []);

  const openFromToast = useCallback(() => {
    setOpen(true);
    setUnread(0);
    setToastVisible(false);
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return { messages, unread, open, thinking, toastVisible, runAnalysis, toggle, openFromToast, dismissToast };
}
