import type { Message } from "../lib/message";
import { Cursors } from "./cursors";
import { Whiteboard } from "./whiteboard";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  if (canvas === null) {
    throw new Error("No canvas found");
  }
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("Failed to get context");
  }

  const myID = crypto.randomUUID();
  const host = new URL(document.URL).host;
  const socket = new WebSocket(`ws://${host}`);

  function send(msg: object) {
    socket.send(JSON.stringify({ id: myID, data: msg }));
  }

  socket.addEventListener("open", () => {
    send({ event: "open" });
  });

  socket.addEventListener("close", () => {
    send({ event: "close" });
  });

  const cursors = new Cursors(send);
  cursors.init(canvas);

  const board = new Whiteboard(canvas, ctx, send);
  board.init();

  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data) as Message;
    if (msg.id === myID) {
      return;
    }
    switch (msg.data.event) {
      case "close":
        cursors.remove(msg.id);
        break;
      case "cursor":
        cursors.update(msg.id, msg.data.x, msg.data.y);
        break;
      case "shape-drawing":
        board.addDrawing(msg.data.shape);
        break;
      case "shape":
        board.add(msg.data.shape);
        break;
      default:
        break;
    }
  });

  function renderingLoop() {
    board.render();
    requestAnimationFrame(renderingLoop);
  }
  requestAnimationFrame(renderingLoop);
});
