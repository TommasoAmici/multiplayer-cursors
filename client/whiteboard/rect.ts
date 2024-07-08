import type { RectShape } from "../../lib/shape";
import type { RenderOptions, State } from "./types";

export class WhiteboardRect {
  static render(
    ctx: CanvasRenderingContext2D,
    shape: RectShape,
    options?: RenderOptions
  ) {
    ctx.save();
    if (options?.opacity) {
      ctx.globalAlpha = options.opacity;
    }
    ctx.fillStyle = shape.color;
    const x = Math.min(shape.start.x, shape.end.x);
    const y = Math.min(shape.start.y, shape.end.y);
    const w = Math.abs(shape.start.x - shape.end.x);
    const h = Math.abs(shape.start.y - shape.end.y);
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  static begin(state: State, beginX: number, beginY: number) {
    state.drawing = {
      id: crypto.randomUUID(),
      shape: state.selectedShape,
      color: state.selectedColor,
      start: { x: beginX, y: beginY },
      end: { x: beginX, y: beginY },
    };
  }

  static update(state: State, currentX: number, currentY: number) {
    if (state.drawing === undefined) {
      return;
    }
    state.drawing.end = { x: currentX, y: currentY };
  }

  static end(state: State) {
    if (state.drawing === undefined) {
      return;
    }
    const rect = structuredClone(state.drawing);
    state.shapes.push(rect);
    state.drawing = undefined;
    return rect;
  }
}
