import type { Shape } from "./shape";

export type MessageCursor = {
  id: string;
  data: { x: number; y: number; event: "cursor" };
};

export type MessageClose = {
  id: string;
  data: { event: "close" };
};

export type Message =
  | MessageCursor
  | MessageClose
  | {
      id: string;
      data:
        | { event: "open" }
        | { shape: Shape; event: "shape" }
        | { shape: Shape; event: "shape-drawing" };
    };
