"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Sparkles } from "lucide-react";

import { useTRPC } from "@karakeep/shared-react/trpc";
import { parseSearchQuery } from "@karakeep/shared/searchQueryParser";
import { ZBookmarkList } from "@karakeep/shared/types/lists";

import { useBookmarkLists } from "@karakeep/shared-react/hooks/lists";

import { FOLDER_COLORS, folderIndex } from "../bookmarks/HomeMap";
import QueryExplainerTooltip from "../search/QueryExplainerTooltip";
import { ListOptions } from "./ListOptions";
import {
  ListCollaboratorsIcons,
  ListPrivacyLabel,
} from "./ListHeaderComponents";

export default function ListHeader({
  initialData,
}: {
  initialData: ZBookmarkList;
}) {
  const api = useTRPC();
  const { t } = useTranslation();
  const router = useRouter();
  const { data: list, error } = useQuery(
    api.lists.get.queryOptions(
      {
        listId: initialData.id,
      },
      {
        initialData,
      },
    ),
  );

  const { data: statsData } = useQuery(
    api.lists.stats.queryOptions(undefined, {
      placeholderData: keepPreviousData,
    }),
  );
  const itemCount = statsData?.stats.get(list.id);
  const { data: allLists } = useBookmarkLists();
  const slot = folderIndex(allLists?.data ?? [], list.id);

  const parsedQuery = useMemo(() => {
    if (!list.query) {
      return null;
    }
    return parseSearchQuery(list.query);
  }, [list.query]);

  if (error) {
    // This is usually exercised during list deletions.
    if (error.data?.code == "NOT_FOUND") {
      router.push("/dashboard/lists");
    }
  }

  return (
    <div
      className={`bd-cf relative flex items-start justify-between gap-4 p-5 text-bd-ink ${FOLDER_COLORS[slot % FOLDER_COLORS.length]}`}
    >
      <div className="bd-hatch pointer-events-none absolute inset-y-0 right-0 w-1/4 opacity-60" />
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className="bd-cfs flex size-16 shrink-0 items-center justify-center bg-bd-ink text-4xl">
          {list.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="bd-label">
            Cartella // {String(slot + 1).padStart(2, "0")}
          </div>
          <h1 className="truncate text-4xl font-black leading-none tracking-tight">
            {list.name}
          </h1>
          {list.description && (
            <p className="mt-1 opacity-75">{list.description}</p>
          )}
          <div className="bd-label mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {itemCount !== undefined && (
              <>
                <span>{t("lists.items_count", { count: itemCount })}</span>
                <span aria-hidden>·</span>
              </>
            )}
            <ListPrivacyLabel list={list} />
            {parsedQuery && (
              <>
                <span aria-hidden>·</span>
                <QueryExplainerTooltip
                  parsedSearchQuery={parsedQuery}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex cursor-help items-center gap-1 transition-opacity hover:opacity-70"
                    >
                      <Sparkles className="size-3.5" />
                      {t("lists.smart_list")}
                    </button>
                  }
                />
              </>
            )}
            <ListCollaboratorsIcons list={list} />
          </div>
        </div>
      </div>
      <div className="relative flex shrink-0 items-center gap-2">
        {itemCount !== undefined && (
          <span className="bd-glitch text-6xl font-black leading-none tracking-tighter">
            {String(itemCount).padStart(2, "0")}
          </span>
        )}
        <ListOptions list={list}>
          <Button variant="ghost">
            <MoreHorizontal className="size-6" />
          </Button>
        </ListOptions>
      </div>
    </div>
  );
}
