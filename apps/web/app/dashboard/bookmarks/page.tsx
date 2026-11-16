import type { Metadata } from "next";
import React from "react";
import Bookmarks from "@/components/dashboard/bookmarks/Bookmarks";
import HomeMap from "@/components/dashboard/bookmarks/HomeMap";
import { api } from "@/server/api/client";
import { useTranslation } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  // oxlint-disable-next-line rules-of-hooks
  const { t } = await useTranslation();
  return {
    title: `${t("common.home")} | BrainDump`,
  };
}

export default async function BookmarksPage() {
  const lists = await api.lists.list();
  return (
    <div className="flex flex-col gap-6">
      <HomeMap initialLists={lists.lists} />
      <Bookmarks query={{ archived: false }} showEditorCard={true} />
    </div>
  );
}
