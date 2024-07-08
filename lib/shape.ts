export type RectShape = {
  id: string;
  shape: "rect";
  color: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type Shape = RectShape;
