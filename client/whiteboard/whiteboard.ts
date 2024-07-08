import throttle from "lodash/throttle";
import { colors } from "../../lib/colors";
import type { Message } from "../../lib/message";
import type { Shape } from "../../lib/shape";
import { WhiteboardRect } from "./rect";
import type { State } from "./types";

const OPACITY_WHEN_DRAWING = 0.6;
const DRAWING_THROTTLE_SEND_MS = 120;

const WHITEBOARD_SHAPES = {
  rect: WhiteboardRect,
};

export class Whiteboard {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #state: State;
  #drawn: Set<string>;
  #send: (data: Message["data"]) => void;
  #throttledSend: (data: Message["data"]) => void;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    send: (msg: object) => void
  ) {
    this.#canvas = canvas;
    this.#ctx = ctx;
    this.#state = {
      selectedColor: colors[0].value,
      selectedShape: "rect",
      drawing: undefined,
      othersDrawing: {},
      shapes: [],
    };
    this.#drawn = new Set();
    this.#send = send;
    this.#throttledSend = throttle(send, DRAWING_THROTTLE_SEND_MS);
  }

  init() {
    this.#initColorPicker();
    this.#initCanvas();
  }

  #initColorPicker() {
    const colorButtons = document.querySelectorAll<HTMLButtonElement>(
      "#color-picker button"
    );
    colorButtons.forEach((button) => {
      const colorIndexStr = button.dataset.color;
      if (colorIndexStr === undefined) {
        throw new Error("Color missing on button");
      }
      const colorIndex = parseInt(colorIndexStr);
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.#state.selectedColor = colors[colorIndex].value;
      });
    });
  }

  #initCanvas() {
    this.#canvas.setAttribute("width", window.innerWidth.toString());
    this.#canvas.setAttribute("height", window.innerHeight.toString());

    this.#canvas.addEventListener("pointerdown", (e) => {
      const shape = WHITEBOARD_SHAPES[this.#state.selectedShape];
      shape.begin(this.#state, e.clientX, e.clientY);
    });

    this.#canvas.addEventListener("pointerup", () => {
      if (this.#state.drawing === undefined) {
        return;
      }
      const wb = WHITEBOARD_SHAPES[this.#state.selectedShape];
      const added = wb.end(this.#state);
      if (added) {
        this.#send({ event: "shape", shape: added });
      }
    });

    this.#canvas.addEventListener("pointermove", (e) => {
      if (this.#state.drawing === undefined) {
        return;
      }
      const wb = WHITEBOARD_SHAPES[this.#state.selectedShape];
      wb.update(this.#state, e.clientX, e.clientY);
      this.#throttledSend({
        event: "shape-drawing",
        shape: this.#state.drawing,
      });
    });
  }

  render() {
    const isDrawing = this.#state.drawing?.shape !== undefined;
    const shapesPending = this.#state.shapes.some(
      (s) => !this.#drawn.has(s.id)
    );
    const othersDrawing = Object.values(this.#state.othersDrawing).length > 0;
    const shouldRedraw = isDrawing || shapesPending || othersDrawing;
    if (!shouldRedraw) {
      return;
    }

    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#drawn = new Set();
    for (const shape of this.#state.shapes) {
      const wb = WHITEBOARD_SHAPES[shape.shape];
      wb.render(this.#ctx, shape);
      this.#drawn.add(shape.id);
    }
    for (const shape of Object.values(this.#state.othersDrawing)) {
      const wb = WHITEBOARD_SHAPES[shape.shape];
      wb.render(this.#ctx, shape, { opacity: OPACITY_WHEN_DRAWING });
    }
    if (this.#state.drawing?.shape === undefined) {
      return;
    }
    const shape = WHITEBOARD_SHAPES[this.#state.drawing.shape];
    shape.render(this.#ctx, this.#state.drawing, {
      opacity: OPACITY_WHEN_DRAWING,
    });
  }

  add(shape: Shape) {
    delete this.#state.othersDrawing[shape.id];
    this.#state.shapes.push(shape);
  }

  addDrawing(shape: Shape) {
    this.#state.othersDrawing[shape.id] = shape;
  }
}
