/** Tannin (Jed 1.x) locale data: domain → key (`context\u0004msgid` or `msgid`) → forms. */
export type LocaleData = Record<
  string,
  Record<string, string[] | { domain?: string; lang?: string; plural_forms?: string }>
>
