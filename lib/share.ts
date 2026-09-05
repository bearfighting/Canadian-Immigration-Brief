export type ShareLinks = {
  facebook: string;
  x: string;
  whatsapp: string;
  telegram: string;
  linkedin: string;
  weibo: string;
};

export function createShareLinks(url: string, title: string, description: string): ShareLinks {
  const text = `${title}\n${description}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}`,
  };
}
