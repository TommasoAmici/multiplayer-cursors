import type { ServerWebSocket } from "bun";
import path from "path";
import { renderToReadableStream } from "react-dom/server";
import type { Message } from "../lib/message";
import { Page } from "./Page";

/**
 * Holds websockets in memory so we can broker a message to the entire
 * room when something happens.
 */
const room: Record<string, ServerWebSocket<unknown>> = {};

async function handleIndexPage() {
  const stream = await renderToReadableStream(<Page />);
  return new Response(stream, {
    headers: { "Content-Type": "text/html" },
  });
}

async function handleClientFiles(url: URL) {
  const ext = path.extname(url.pathname);
  const filePath = path.join(import.meta.dir, "..", url.pathname);
  const file = Bun.file(filePath);
  switch (ext) {
    // bundle typescript for client
    case ".ts":
    case ".tsx":
      const { outputs } = await Bun.build({
        entrypoints: [filePath],
        target: "browser",
        minify: true,
        splitting: false,
        format: "esm",
      });
      const js = await outputs[0].text();
      return new Response(js, {
        headers: { "Content-Type": "text/javascript" },
      });

    // serve static files
    default:
      return new Response(file, {
        headers: { "Content-Type": file.type },
      });
  }
}

const server = Bun.serve({
  async fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      return undefined;
    }

    const url = new URL(req.url);
    if (url.pathname.startsWith("/client")) {
      return handleClientFiles(url);
    }

    return handleIndexPage();
  },
  websocket: {
    async message(ws, message) {
      const parsed: Message = JSON.parse(message.toString());
      switch (parsed.data.event) {
        case "open":
          room[parsed.id] = ws;
          break;
        // @ts-expect-error we want close to fallback to it's propagated
        // to all connected clients
        case "close":
          delete room[parsed.id];
        default:
          for (const member of Object.values(room)) {
            member.send(message);
          }
      }
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
