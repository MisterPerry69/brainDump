"use client";

import Link from "next/link";
import { EditListModal } from "@/components/dashboard/lists/EditListModal";
import { cn } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import type { ZBookmarkList } from "@karakeep/shared/types/lists";
import {
  augmentBookmarkListsWithInitialData,
  useBookmarkLists,
} from "@karakeep/shared-react/hooks/lists";
import { useTRPC } from "@karakeep/shared-react/trpc";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

// Folder colors rotate by position (no color column in the db).
export const FOLDER_COLORS = [
  "bg-bd-f1",
  "bg-bd-f2",
  "bg-bd-f3",
  "bg-bd-f4",
  "bg-bd-f5",
] as const;

/** Color slot of a folder: top-level lists by creation order, sub-lists inherit the parent's. */
export function folderIndex(lists: ZBookmarkList[], id: string): number {
  const top = lists.filter((l) => !l.parentId);
  const own = top.findIndex((l) => l.id === id);
  if (own >= 0) return own;
  const parent = lists.find((l) => l.id === id)?.parentId;
  return parent ? folderIndex(lists, parent) : 0;
}

// shortcut: inbox count is capped at INBOX_LIMIT ("50+"), add a count endpoint if it matters.
const INBOX_LIMIT = 50;

const KIND: Record<string, string> = {
  link: "LINK",
  text: "NOTA",
  asset: "FILE",
};

function title(b: ZBookmark) {
  return getBookmarkTitle(b) ?? "Senza titolo";
}

function hhmm(d: Date) {
  return new Date(d).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InboxBlock({ items }: { items: ZBookmark[] | undefined }) {
  const n = items?.length ?? 0;
  const label =
    n >= INBOX_LIMIT ? `${INBOX_LIMIT}+` : String(n).padStart(2, "0");
  const deg = Math.min(n / INBOX_LIMIT, 1) * 360;
  return (
    <div className="bd-cf relative flex min-h-[328px] flex-col gap-3 bg-primary p-3 text-bd-ink md:w-[220px] md:shrink-0">
      <div className="bd-label">00 / Da_smistare</div>
      <div
        className="mx-auto grid size-[130px] place-items-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--bd-ink)) 0 ${deg}deg, hsl(var(--bd-ink) / .22) ${deg}deg 360deg)`,
        }}
      >
        <div className="grid size-[100px] place-items-center rounded-full bg-primary">
          <div className="text-center">
            <div className="text-5xl font-black leading-none tracking-tighter">
              {label}
            </div>
            <div className="bd-label">da smistare</div>
          </div>
        </div>
      </div>
      <div className="border-t-[1.5px] border-bd-ink pt-1 font-mono text-[11px] leading-[2]">
        {items?.slice(0, 3).map((b) => (
          <div key={b.id} className="truncate">
            ▪ {title(b)}
          </div>
        ))}
        {n > 3 && <div className="opacity-60">+ altre {n - 3}</div>}
        {n === 0 && <div className="opacity-60">Tutto smistato.</div>}
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <div className="bd-hazard h-2" />
        <Link
          href="/dashboard/smista"
          className="flex h-8 items-center justify-between bg-bd-ink px-3 text-sm font-black text-primary"
        >
          SMISTA <span>→</span>
        </Link>
      </div>
    </div>
  );
}

function FolderBlock({
  list,
  index,
  count,
  big,
}: {
  list: ZBookmarkList;
  index: number;
  count: number;
  big: boolean;
}) {
  return (
    <Link
      href={`/dashboard/lists/${list.id}`}
      className={cn(
        "bd-cf relative block min-w-[120px] overflow-hidden p-3 text-bd-ink transition-transform hover:-translate-y-0.5",
        FOLDER_COLORS[index % FOLDER_COLORS.length],
        big ? "h-[196px]" : "h-[124px]",
      )}
      style={{ flexGrow: Math.max(count, 1), flexBasis: 0 }}
    >
      <div className="bd-label">
        {String(index + 1).padStart(2, "0")} {big && `// ${list.name}`}
      </div>
      <div
        className={cn(
          "absolute right-3 top-2 font-black leading-none tracking-tighter",
          big ? "bd-glitch text-6xl" : "text-4xl",
        )}
      >
        {String(count).padStart(2, "0")}
      </div>
      <div
        className={cn(
          "absolute bottom-3 left-3 right-3 truncate font-black leading-none tracking-tight",
          big ? "text-4xl" : "text-xl",
        )}
      >
        {list.icon} {list.name}
      </div>
    </Link>
  );
}

function IncomingTape({ items }: { items: ZBookmark[] | undefined }) {
  if (!items?.length) return null;
  return (
    <div className="flex h-7 items-center gap-4 overflow-hidden whitespace-nowrap border-[1.5px] border-bd-line/25 pr-3 font-mono text-[11px]">
      <span className="flex h-full items-center bg-primary px-2 font-bold text-bd-ink">
        IN_ARRIVO &gt;&gt;
      </span>
      {items.map((b, i) => (
        <span key={b.id} className="flex gap-4">
          {i > 0 && <span className="text-muted-foreground">//</span>}
          <span>
            {hhmm(b.createdAt)} [{KIND[b.content.type] ?? "?"}] {title(b)}
          </span>
        </span>
      ))}
    </div>
  );
}

function useMapData(initialLists: ZBookmarkList[]) {
  const api = useTRPC();
  const { data: listsData } = useBookmarkLists();
  // Same as the sidebar: server data first, so SSR and client agree.
  const lists = augmentBookmarkListsWithInitialData(listsData, initialLists);
  const { data: stats } = useQuery(
    api.lists.stats.queryOptions(undefined, {
      placeholderData: keepPreviousData,
    }),
  );
  const { data: inbox } = useQuery(
    api.bookmarks.getBookmarks.queryOptions({
      archived: false,
      inList: false,
      limit: INBOX_LIMIT,
    }),
  );
  const folders = (lists?.data ?? [])
    .filter((l) => !l.parentId)
    // index = stable position (creation order), so a folder keeps its color
    .map((l, index) => ({ list: l, index, count: stats?.stats.get(l.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  return { folders, inbox: inbox?.bookmarks };
}

function NewFolder({ className }: { className?: string }) {
  return (
    <EditListModal>
      <button
        className={cn(
          "bd-label border-[1.5px] border-dashed border-bd-line/40 px-3 py-2 text-muted-foreground hover:border-primary hover:text-primary",
          className,
        )}
      >
        + nuova_cartella
      </button>
    </EditListModal>
  );
}

/** The map as a column, beside an open folder (bozza 09). */
export function FolderColumn({
  initialLists,
  currentId,
}: {
  initialLists: ZBookmarkList[];
  currentId: string;
}) {
  const { folders, inbox } = useMapData(initialLists);
  const n = inbox?.length ?? 0;
  return (
    <nav className="hidden w-48 shrink-0 flex-col gap-2 md:flex">
      <Link
        href="/dashboard/smista"
        className="bd-cfs flex flex-col bg-primary text-bd-ink"
      >
        <span className="flex items-center justify-between px-3 py-2 font-black">
          Da smistare
          <span className="font-mono text-xs">
            {n >= INBOX_LIMIT ? INBOX_LIMIT + "+" : String(n).padStart(2, "0")}
          </span>
        </span>
        <span className="bd-hazard h-1.5" />
      </Link>
      {folders.map(({ list, index, count }) => (
        <Link
          key={list.id}
          href={`/dashboard/lists/${list.id}`}
          className={cn(
            "bd-cfs flex items-center justify-between px-3 py-2 font-black text-bd-ink transition-transform",
            FOLDER_COLORS[index % FOLDER_COLORS.length],
            list.id === currentId ? "translate-x-3" : "hover:translate-x-1",
          )}
        >
          <span className="truncate">{list.name}</span>
          <span className="font-mono text-xs">
            {String(count).padStart(2, "0")}
          </span>
        </Link>
      ))}
      <NewFolder />
      <div className="bd-label mt-2 text-muted-foreground">
        Totale {folders.reduce((t, f) => t + f.count, 0)}
      </div>
    </nav>
  );
}

export default function HomeMap({
  initialLists,
}: {
  initialLists: ZBookmarkList[];
}) {
  const api = useTRPC();
  const { folders, inbox } = useMapData(initialLists);
  const { data: recent } = useQuery(
    api.bookmarks.getBookmarks.queryOptions({ limit: 5 }),
  );
  const rows = [folders.slice(0, 2)];
  for (let i = 2; i < folders.length; i += 3)
    rows.push(folders.slice(i, i + 3));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="bd-label text-muted-foreground">
          Settore_A // Mappa_archivio // {folders.length} cartelle
        </div>
        <div className="bd-ticks-x flex-1 opacity-40" />
        <NewFolder className="py-1" />
      </div>
      <div className="flex flex-col gap-2 md:flex-row">
        <InboxBlock items={inbox} />
        <div className="flex flex-1 flex-col gap-2">
          {folders.length === 0 && (
            <div className="bd-cf grid h-[196px] place-items-center border-[1.5px] border-dashed border-bd-line/40 font-mono text-sm text-muted-foreground">
              Nessuna cartella. Creane una dalla barra laterale.
            </div>
          )}
          {rows.map((row, r) => (
            <div key={r} className="flex flex-wrap gap-2">
              {row.map(({ list, count, index }) => (
                <FolderBlock
                  key={list.id}
                  list={list}
                  count={count}
                  index={index}
                  big={r === 0}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <IncomingTape items={recent?.bookmarks} />
    </section>
  );
}
