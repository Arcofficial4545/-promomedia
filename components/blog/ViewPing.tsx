"use client";

import { useEffect } from "react";
import { registerView } from "@/lib/actions/views";

/** Fires a view-count ping once after mount (keeps article pages static). */
export function ViewPing({ postId }: { postId: string }) {
  useEffect(() => {
    void registerView(postId);
  }, [postId]);
  return null;
}
