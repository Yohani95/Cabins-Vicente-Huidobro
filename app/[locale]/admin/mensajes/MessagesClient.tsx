"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Archive, Inbox, MailCheck, RefreshCcw, Reply, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useServerAction } from "@/hooks/useServerAction";
import {
  archiveMessageAction,
  markMessageReadAction
} from "@/app/actions/messages";
import type { ActionResult } from "@/app/actions/reservations";
import { formatDateShort } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "unread", "archived"] as const;

type Message = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  message: string;
  source: string | null;
  is_read: boolean;
  archived: boolean;
  created_at: string;
};

type MessagesClientProps = {
  locale: string;
  messages: Message[];
};

export default function MessagesClient({ locale, messages }: MessagesClientProps) {
  const t = useTranslations("admin.mensajes");
  const statusT = useTranslations("admin.mensajes.status");
  const router = useRouter();

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const markReadSA = useServerAction<Record<string, unknown>, ActionResult>((payload) =>
    markMessageReadAction(locale, payload)
  );
  const archiveSA = useServerAction<Record<string, unknown>, ActionResult>((payload) =>
    archiveMessageAction(locale, payload)
  );

  const filteredMessages = useMemo(() => {
    return messages
      .filter((message) => {
        if (filter === "unread") return !message.is_read && !message.archived;
        if (filter === "archived") return message.archived;
        return true;
      })
      .filter((message) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return [
          message.guest_name,
          message.guest_email ?? "",
          message.guest_phone ?? "",
          message.message
        ].some((value) => value.toLowerCase().includes(term));
      });
  }, [filter, messages, searchTerm]);

  const handleMarkRead = (id: string) => {
    markReadSA.setError("");
    markReadSA.execute({ id }, () => router.refresh());
  };

  const handleArchiveToggle = (message: Message) => {
    archiveSA.setError("");
    archiveSA.execute(
      { id: message.id, archived: !message.archived, is_read: true },
      () => router.refresh()
    );
  };

  const formatDate = (value: string) => formatDateShort(value, locale === "en" ? "en-US" : "es-CL");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-olive">{t("title")}</h1>
          <p className="text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-sand/40 bg-white/80 px-2 py-1 shadow-inner">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-semibold transition",
                  filter === item
                    ? "bg-olive text-white"
                    : "text-slate-600 hover:bg-olive/10 hover:text-olive"
                )}
                onClick={() => setFilter(item)}
              >
                {t(`filters.${item}`)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-64 rounded-xl border border-sand/40 bg-white/80 py-2 pl-9 pr-3 text-sm shadow-inner outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.refresh()}
            disabled={markReadSA.isPending || archiveSA.isPending}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </header>

      {(markReadSA.error || archiveSA.error) && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {markReadSA.error || archiveSA.error}
        </p>
      )}

      {filteredMessages.length === 0 ? (
        <section className="rounded-3xl border border-sand/30 bg-white/80 p-8 text-center shadow-card">
          <Inbox className="mx-auto h-10 w-10 text-olive" />
          <h2 className="mt-4 text-lg font-semibold text-olive">
            {t("empty.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t("empty.description")}</p>
        </section>
      ) : (
        <section className="rounded-3xl border border-sand/30 bg-white/90 shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sand/30 text-left text-sm text-slate-700">
              <thead className="bg-sand/10 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">{t("table.guest")}</th>
                  <th className="px-6 py-3">{t("table.contact")}</th>
                  <th className="px-6 py-3">{t("table.message")}</th>
                  <th className="px-6 py-3">{t("table.received")}</th>
                  <th className="px-6 py-3 text-right">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/20">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className={!message.is_read ? "bg-olive/5" : undefined}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {message.guest_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {statusT(message.archived ? "archived" : message.is_read ? "read" : "unread")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {message.guest_email ?? "—"}
                      <br />
                      {message.guest_phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {message.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!message.is_read && !message.archived && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkRead(message.id)}
                            disabled={markReadSA.isPending}
                          >
                            <MailCheck className="mr-1 h-4 w-4" />
                            {t("actions.mark_read")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchiveToggle(message)}
                          disabled={archiveSA.isPending}
                        >
                          {message.archived ? (
                            <>
                              <Inbox className="mr-1 h-4 w-4" />
                              {t("actions.restore")}
                            </>
                          ) : (
                            <>
                              <Archive className="mr-1 h-4 w-4" />
                              {t("actions.archive")}
                            </>
                          )}
                        </Button>
                        {message.guest_phone && (
                          <a
                            href={`https://wa.me/${formatPhone(message.guest_phone)}?text=${encodeURIComponent(
                              `Hola ${message.guest_name}, te escribe Cabañas Vicente Huidobro.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost">
                              <Reply className="mr-1 h-4 w-4" />
                              {t("actions.reply_whatsapp")}
                            </Button>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function formatPhone(value: string) {
  return value.replace(/[^0-9]/g, "");
}
