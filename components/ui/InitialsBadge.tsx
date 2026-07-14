import { initialsFromNickname, nicknameToHsl } from "@/lib/format";

type Props = {
  nickname: string;
  size?: "sm" | "md" | "lg";
  title?: string;
};

const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function InitialsBadge({ nickname, size = "md", title }: Props) {
  const initials = initialsFromNickname(nickname);
  const bg = nicknameToHsl(nickname);
  const suffixMatch = nickname.match(/#(\d+)$/);
  return (
    <span
      title={title ?? nickname}
      className={[
        "relative inline-flex select-none items-center justify-center rounded-full font-bold text-white ring-2 ring-neutral-950",
        sizes[size],
      ].join(" ")}
      style={{ backgroundColor: bg }}
    >
      {initials}
      {suffixMatch ? (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-neutral-950 px-1 text-[9px] font-semibold text-neutral-200 ring-1 ring-neutral-800">
          #{suffixMatch[1]}
        </span>
      ) : null}
    </span>
  );
}
