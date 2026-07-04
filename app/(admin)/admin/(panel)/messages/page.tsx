import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MarkReadButton } from "@/components/admin/MarkReadButton";
import { Badge } from "@/components/ui/Badge";
import { listContactMessages } from "@/lib/db/repositories/contact";
import { formatDate } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const messages = await listContactMessages();
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description={`${messages.length} total, ${unread} unread`}
      />
      {messages.length === 0 ? (
        <p className="text-sm text-ink-subtle">No contact messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className="rounded-[var(--radius-card)] border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-medium text-ink">{message.name}</p>
                <a
                  href={`mailto:${message.email}`}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  {message.email}
                </a>
                <span className="text-xs text-ink-subtle">
                  {formatDate(message.createdAt)}
                </span>
                {!message.isRead ? (
                  <Badge variant="emerald">New</Badge>
                ) : (
                  <Badge variant="outline">Read</Badge>
                )}
                {!message.isRead && (
                  <span className="ml-auto">
                    <MarkReadButton id={message.id} />
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-muted">
                {message.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
