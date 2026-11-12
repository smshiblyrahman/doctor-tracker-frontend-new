"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
}

/**
 * Typing updates local state immediately; the URL (and therefore the query key)
 * only changes after 300ms of inactivity, so each keystroke does not fire a request.
 */
export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebounce(draft, 300);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // External changes (e.g. "Clear filters", back button) win over the draft.
  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (debounced.trim() !== value) onChangeRef.current(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => setDraft("")}
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
