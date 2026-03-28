"use client";

import { useState } from "react";

export default function CopyLinkButton({ slug }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/galaxies/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="clay-btn-ghost px-5 py-2.5 text-sm"
    >
      {copied ? "✓ Copied!" : "🔗 Share link"}
    </button>
  );
}
