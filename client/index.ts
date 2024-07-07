import throttle from "lodash/throttle";

const colors = [
  "#dc2626",
  "#eab308",
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#64748b",
];

const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

document.addEventListener("DOMContentLoaded", () => {
  const host = new URL(document.URL).host;
  const socket = new WebSocket(`ws://${host}`);
  const myID = crypto.randomUUID();

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ id: myID, event: "open" }));
  });

  socket.addEventListener("close", () => {
    socket.send(JSON.stringify({ id: myID, event: "close" }));
  });

  socket.addEventListener("message", (event) => {
    const { id, x, y } = JSON.parse(event.data);
    if (id === myID) {
      return;
    }
    let cursor = document.getElementById(id);
    if (cursor === null) {
      const baseCursor = document.getElementById("cursor");
      if (baseCursor === null) {
        throw new Error("No base cursor");
      }
      const cursor = baseCursor.cloneNode(true) as HTMLElement;

      cursor.id = id;
      cursor.classList.remove("hidden");

      const color = colors[cyrb53(id) % colors.length];
      cursor.setAttribute("fill", color);

      cursor.style.transform = `translate(${x}px, ${y}px)`;
      baseCursor.after(cursor);
    } else {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    }
  });

  const mousemoveListener = throttle((e: MouseEvent) => {
    const data = JSON.stringify({
      id: myID,
      x: e.clientX,
      y: e.clientY,
      event: "mousemove",
    });
    socket.send(data);
  }, 60);

  document.addEventListener("mousemove", mousemoveListener);
});
