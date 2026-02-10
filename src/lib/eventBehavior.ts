// src/lib/eventBehavior.ts

export type EventBehavior = {
  timeModel: "fixed" | "session" | "day_span";
  showExactTime: boolean;
  hasClearEnd: boolean;
  movementProfile: "entry_peak" | "steady" | "exit_peak";
};
