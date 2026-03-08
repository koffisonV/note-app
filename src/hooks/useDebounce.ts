import { useEffect, useRef, useCallback } from 'react';

export function useDebounce(
  callback: () => void,
  delay: number,
  dependencies: unknown[],
): { cancel: () => void; flush: () => void } {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const isFirstRender = useRef(true);

  callbackRef.current = callback;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    callbackRef.current();
  }, [cancel]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    cancel();
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => cancel, [cancel]);

  return { cancel, flush };
}
