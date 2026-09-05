"use client";

import { useState } from "react";
import { actionVariants } from "@/components/ui/button";
import { createShareLinks } from "@/lib/share";

type ShareBarProps = {
  url: string;
  title: string;
  description: string;
};

const platformLabels = {
  facebook: "Facebook",
  x: "X",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  weibo: "微博",
} as const;

function fallbackCopy(url: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

export function ShareBar({ url, title, description }: ShareBarProps) {
  const [status, setStatus] = useState("");
  const shareLinks = createShareLinks(url, title, description);

  async function shareWithDevice() {
    if (!navigator.share) {
      setStatus("当前浏览器不支持系统分享，请选择其他平台或复制链接。");
      return;
    }
    try {
      await navigator.share({ title, text: description, url });
      setStatus("已打开系统分享菜单。");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("系统分享暂时不可用，请选择其他平台或复制链接。");
    }
  }

  async function copyLink() {
    try {
      if (typeof navigator.clipboard?.writeText === "function") {
        await navigator.clipboard.writeText(url);
      } else if (!fallbackCopy(url)) {
        throw new Error("复制失败");
      }
      setStatus("链接已复制。");
    } catch {
      setStatus("复制失败，请手动复制地址栏中的链接。");
    }
  }

  return (
    <section
      className="mt-8 rounded-xl border bg-surface-muted p-5"
      aria-labelledby="share-heading"
    >
      <h2 id="share-heading" className="text-lg font-semibold">
        分享本文
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={actionVariants()} onClick={shareWithDevice}>
          系统分享
        </button>
        {Object.entries(shareLinks).map(([platform, shareUrl]) => {
          const label = platformLabels[platform as keyof typeof platformLabels];
          const ariaLabel = platform === "weibo" ? "分享到微博" : `分享到 ${label}`;
          return (
            <a
              key={platform}
              href={shareUrl}
              className={actionVariants()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
            >
              {label}
            </a>
          );
        })}
        <button type="button" className={actionVariants()} onClick={copyLink}>
          复制链接
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {status}
      </p>
      <noscript>
        <p className="mt-3 text-sm text-muted-foreground">
          当前未启用 JavaScript，请选择平台分享：
        </p>
        <ul className="mt-2 flex flex-wrap gap-3 text-sm">
          {Object.entries(shareLinks).map(([platform, shareUrl]) => (
            <li key={platform}>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                {platformLabels[platform as keyof typeof platformLabels]}
              </a>
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
