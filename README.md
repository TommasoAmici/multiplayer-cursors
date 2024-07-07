# multiplayer-cursors

A very minimal example of Figma-like multiplayer cursors using WebSockets.

This small example uses Bun to run a server to hold the WebSocket connections
and to serve the client files.

A cool thing that Bun makes possible is bundling TypeScript on the fly before
sending it to the browser. Obviously, in production you'd want to either
precompile or cache the compiled files, but for small stuff it's great.

Another cool thing is using React JSX to generate the HTML.

## Running

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run server/index.tsx
```
