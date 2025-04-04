// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { AnthropicThinkingConfig } from "../shared/types/llm/providers/anthropic.js";
import type { BaseModelSettings } from "./core.js";

export type AnthropicModelSettings = {
  base: BaseModelSettings;
  thinking: AnthropicThinkingConfig | null;
  tools: Array<AnthropicTool> | null;
  tool_choice: AnthropicToolChoice | null;
};

export type AnthropicTool = {
  name: string;
  description: string | null;
  input_schema: InputSchema;
};

export type AnthropicToolChoice = {
  type: AnthropicToolChoiceType;
  disable_parallel_tool_use: boolean | null;
};

export type AnthropicToolChoiceType = "auto";

export type InputSchema = {
  type: string;
  properties: { [key in string]?: PropertySchema };
  required: Array<string> | null;
};

export type PropertySchema = {
  type: string;
  description: string | null;
  enum_values: Array<string> | null;
};
