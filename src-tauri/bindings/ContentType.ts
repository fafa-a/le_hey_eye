// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { ContentItem } from "../../types/core.js";

export type ContentType =
  | { "type": "PlainText" } & string
  | { "type": "StructuredContent" } & Array<ContentItem>;
