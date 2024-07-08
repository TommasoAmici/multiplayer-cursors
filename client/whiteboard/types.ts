import type { Shape } from "../../lib/shape";

export type State = {
  selectedColor: string;
  selectedShape: Shape["shape"];
  shapes: Shape[];
  drawing: Shape | undefined;
  othersDrawing: Record<Shape["id"], Shape>;
};

export type RenderOptions = {
  opacity?: number;
};
