import { ColorPicker } from "./ColorPicker";
import { CursorTemplate } from "./CursorTemplate";

export function Page() {
  return (
    <html>
      <head>
        <title>Multiplayer Cursors</title>
        <link href="/client/index.css" rel="stylesheet" />
        <script type="module" src="/client/index.ts"></script>
      </head>
      <body>
        <CursorTemplate />
        <canvas id="canvas" />
        <ColorPicker />
      </body>
    </html>
  );
}
