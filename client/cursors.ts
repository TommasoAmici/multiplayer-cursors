import throttle from "lodash/throttle";
import { colors } from "../lib/colors";
import { hash } from "../lib/hash";
import type { Message } from "../lib/message";

const CURSOR_THROTTLE_SEND_MS = 120;

export class Cursors {
  #throttledSend: (data: Message["data"]) => void;

  constructor(send: (msg: object) => void) {
    this.#throttledSend = throttle(send, CURSOR_THROTTLE_SEND_MS);
  }

  init(canvas: HTMLCanvasElement) {
    const pointermoveListener = (e: MouseEvent) => {
      this.#throttledSend({
        x: e.clientX,
        y: e.clientY,
        event: "cursor",
      });
    };
    canvas.addEventListener("pointermove", pointermoveListener);
  }

  remove(id: string) {
    const cursor = document.getElementById(id);
    cursor?.remove();
  }

  add(id: string, x: number, y: number) {
    const baseCursor = document.querySelector<SVGElement>("#cursor");
    if (baseCursor === null) {
      throw new Error("No base cursor");
    }
    const cursor = baseCursor.cloneNode(true) as SVGElement;

    cursor.id = id;
    cursor.classList.remove("hidden");

    const color = colors[hash(id) % colors.length];
    cursor.setAttribute("fill", color.value);

    cursor.style.transform = `translate(${x}px, ${y}px)`;
    baseCursor.after(cursor);
  }

  update(id: string, x: number, y: number) {
    let cursor = document.getElementById(id);
    if (cursor === null) {
      this.add(id, x, y);
    } else {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    }
  }
}
