import type { Messages } from "@/lib/i18n/messages/en";

type Join<K extends string, P extends string> = `${K}.${P}`;

type MessagePaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? Prefix extends ""
      ? K
      : Join<Prefix, K>
    : MessagePaths<T[K], Prefix extends "" ? K : Join<Prefix, K>>;
}[keyof T & string];

export type MessageKey = MessagePaths<Messages>;
