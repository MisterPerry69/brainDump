"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FOLDER_COLORS } from "@/components/dashboard/bookmarks/HomeMap";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import {
  useDeleteBookmark,
  useUpdateBookmark,
} from "@karakeep/shared-react/hooks/bookmarks";
import {
  useAddBookmarkToList,
  useBookmarkLists,
} from "@karakeep/shared-react/hooks/lists";
import { useTRPC } from "@karakeep/shared-react/trpc";
import {
  getBookmarkTitle,
  getSourceUrl,
} from "@karakeep/shared/utils/bookmarkUtils";

const KIND: Record<string, string> = {
  link: "LINK",
  text: "NOTA",
  asset: "FILE",
};

function body(b: ZBookmark) {
  if (b.content.type === "text") return b.content.text;
  if (b.content.type === "link") return b.content.description ?? "";
  if (b.content.type === "asset") return b.content.content ?? "";
  return "";
}

export default function Smista() {
  const api = useTRPC();
  const { data, isPending } = useQuery(
    api.bookmarks.getBookmarks.queryOptions({
      archived: false,
      inList: false,
      limit: 100,
    }),
  );
  // Freeze the inbox at first load: the mutation hooks refetch every
  // getBookmarks query, and the walk must not shift under the cursor.
  const [frozen, setFrozen] = useState<ZBookmark[] | null>(null);
  useEffect(() => {
    if (data && frozen === null) setFrozen(data.bookmarks);
  }, [data, frozen]);
  const { data: lists } = useBookmarkLists();
  const [pos, setPos] = useState(0);
  const [done, setDone] = useState<Record<string, string>>({});

  const items = frozen ?? [];
  const current = items[pos];
  const folders = (lists?.data ?? []).filter((l) => !l.parentId).slice(0, 9);

  const next = (id: string, what: string) => {
    setDone((d) => ({ ...d, [id]: what }));
    setPos((p) => p + 1);
  };

  const { mutate: addToList } = useAddBookmarkToList();
  const { mutate: update } = useUpdateBookmark();
  const { mutate: del } = useDeleteBookmark();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      const n = Number(k);
      if (n >= 1 && n <= folders.length) {
        const list = folders[n - 1];
        addToList(
          { bookmarkId: current.id, listId: list.id },
          { onSuccess: () => next(current.id, list.name) },
        );
      } else if (k === "a") {
        update(
          { bookmarkId: current.id, archived: true },
          { onSuccess: () => next(current.id, "archiviato") },
        );
      } else if (k === "x") {
        if (window.confirm(`Eliminare "${getBookmarkTitle(current)}"?`)) {
          del(
            { bookmarkId: current.id },
            { onSuccess: () => next(current.id, "eliminato") },
          );
        }
      } else if (k === "arrowright" || k === "n") {
        setPos((p) => p + 1);
      } else if (k === "arrowleft") {
        setPos((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (isPending || frozen === null) {
    return <div className="bd-label p-6 text-muted-foreground">Carico…</div>;
  }

  const total = items.length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <div>
          <div className="bd-label text-muted-foreground">
            Modalità smistamento
          </div>
          <div className="whitespace-nowrap text-5xl font-black tracking-tighter">
            {String(Math.min(pos + 1, total)).padStart(2, "0")}
            <span className="text-muted-foreground">
              {" "}
              / {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="mb-2 flex flex-1 gap-1">
          {items.map((b, i) => (
            <div
              key={b.id}
              className={cn(
                "h-2 flex-1",
                done[b.id]
                  ? "bg-bd-line"
                  : i === pos
                    ? "bg-primary"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      {!current ? (
        <div className="bd-cf flex flex-col items-start gap-3 bg-bd-line p-8 text-bd-ink">
          <div className="text-4xl font-black">
            {total === 0 ? "Niente da smistare." : "Giro finito."}
          </div>
          <div className="font-mono text-sm">
            {Object.keys(done).length} smistati su {total}.
          </div>
          <Link
            href="/dashboard/bookmarks"
            className="bg-bd-ink px-4 py-2 font-black text-bd-line"
          >
            TORNA ALLA MAPPA →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <article className="bd-cf flex min-h-[260px] flex-col gap-3 bg-bd-f3 p-6 text-bd-ink">
              <div className="bd-label flex gap-3">
                <span className="bg-bd-ink px-1.5 text-bd-f3">
                  {KIND[current.content.type]}
                </span>
                <span>
                  {new Date(current.createdAt).toLocaleString("it-IT")}
                </span>
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight">
                {getBookmarkTitle(current) ?? "Senza titolo"}
              </h1>
              {getSourceUrl(current) && (
                <a
                  href={getSourceUrl(current)!}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-mono text-xs underline"
                >
                  {getSourceUrl(current)}
                </a>
              )}
              <p className="line-clamp-6 whitespace-pre-wrap font-mono text-sm opacity-80">
                {body(current)}
              </p>
              {current.tags.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {current.tags.map((t) => (
                    <span
                      key={t.id}
                      className="bd-label border border-bd-ink px-1.5"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              )}
            </article>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {folders.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() =>
                    addToList(
                      { bookmarkId: current.id, listId: l.id },
                      { onSuccess: () => next(current.id, l.name) },
                    )
                  }
                  className={cn(
                    "bd-cfs flex items-center gap-2 p-3 text-left font-black text-bd-ink",
                    FOLDER_COLORS[i % FOLDER_COLORS.length],
                  )}
                >
                  <span className="bg-bd-ink px-1.5 font-mono text-xs text-bd-line">
                    {i + 1}
                  </span>
                  <span className="truncate">
                    {l.icon} {l.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="bd-label flex flex-wrap gap-4 text-muted-foreground">
              <span>[1–{folders.length}] cartella</span>
              <span>[A] archivia</span>
              <span>[X] elimina</span>
              <span>[→] salta</span>
              <span>[←] indietro</span>
            </div>
          </div>

          <aside className="flex w-full flex-col gap-1 lg:w-72">
            <div className="bd-label mb-1 text-muted-foreground">In coda</div>
            {items.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setPos(i)}
                className={cn(
                  "flex h-9 items-center gap-2 border-l-4 px-2 text-left font-mono text-xs",
                  i === pos ? "border-primary bg-accent" : "border-transparent",
                  done[b.id] && "opacity-40",
                )}
              >
                <span className="text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 truncate">
                  {getBookmarkTitle(b) ?? "Senza titolo"}
                </span>
                {done[b.id] && (
                  <span className="text-bd-line">→ {done[b.id]}</span>
                )}
              </button>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
