// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { Role } from "./enum.js";

export type Message = {
  id: number;
  topicId: number;
  role: Role;
  content: string;
  createdAt: string;
  tokensUsed: number;
  updatedAt: string | null;
};
