import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ContentListItem } from "@/lib/content/browser";
import { contentPath, contentTypeLabel } from "@/lib/content/routes";
import { formatDateOnly } from "@/lib/format/date";

export function ContentListCard({ item }: { item: ContentListItem }) {
  return (
    <li>
      <Card>
        <p className="text-sm text-muted-foreground">
          {contentTypeLabel(item.contentType)} · {formatDateOnly(item.updatedAt)}
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          <Link href={contentPath(item)}>{item.title}</Link>
        </h2>
        <p className="mt-2 text-muted-foreground">{item.description}</p>
      </Card>
    </li>
  );
}
