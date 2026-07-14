import { Check } from "lucide-react";

import { InitialsBadge } from "@/components/ui/InitialsBadge";
import type { Participant, Session } from "@/types";

type Props = {
  session: Session;
  participants: Participant[];
};

export function ParticipantsPanel({ session, participants }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
        Who&apos;s here
      </h2>
      <ul className="space-y-1 rounded-2xl border border-line bg-surface p-2">
        {participants.map((p) => {
          const isHost = session.host_participant_id === p.id;
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
              <InitialsBadge nickname={p.nickname} size="sm" />
              <span className="flex-1 truncate text-sm text-fg">
                {p.nickname}
                {isHost ? <span className="ml-2 text-xs text-fg-subtle">host</span> : null}
              </span>
              {p.paid_at ? (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <Check className="h-3 w-3" />
                  paid
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
