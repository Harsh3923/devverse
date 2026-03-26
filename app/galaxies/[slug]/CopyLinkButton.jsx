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
      className="rounded-xl border border-gray-700 bg-gray-900 px-5 py-2.5 text-sm font-semibold hover:border-gray-500 hover:bg-gray-800 transition-colors"
    >
      {copied ? "✓ Copied!" : "🔗 Share link"}
    </button>
  );
}
