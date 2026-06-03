import { useCallback, useRef, useState } from 'react';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const copy = useCallback(async (value: string) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => setCopied(false), 1400);
  }, []);

  return { copied, copy };
}
