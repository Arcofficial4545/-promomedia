"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export type FilterSelect = {
  param: string;
  label: string;
  options: { value: string; label: string }[];
  /** Value that removes the param from the URL. */
  emptyValue?: string;
};

type FilterBarProps = {
  searchParam?: string;
  searchPlaceholder?: string;
  selects?: FilterSelect[];
};

/**
 * URL-driven filter bar: text search (debounced) + select filters. Filtering
 * itself happens server-side via searchParams, so results are shareable URLs.
 */
export function FilterBar({
  searchParam = "q",
  searchPlaceholder = "Search",
  selects = [],
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get(searchParam) ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function applyParam(param: string, value: string, emptyValue = "") {
    const params = new URLSearchParams(searchParams.toString());
    if (value === emptyValue || value === "") params.delete(param);
    else params.set(param, value);
    params.delete("page"); // reset pagination on any filter change
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyParam(searchParam, value.trim());
    }, 350);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-11 w-full rounded-[var(--radius-input)] border border-line-strong bg-white pr-3.5 pl-10 text-sm text-ink placeholder:text-ink-subtle focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none"
        />
      </div>
      {selects.map((select) => (
        <label key={select.param} className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap text-ink-muted">
            {select.label}
          </span>
          <select
            value={searchParams.get(select.param) ?? select.emptyValue ?? ""}
            onChange={(e) =>
              applyParam(select.param, e.target.value, select.emptyValue)
            }
            className="h-11 rounded-[var(--radius-input)] border border-line-strong bg-white px-3 text-sm text-ink focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none"
          >
            {select.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
