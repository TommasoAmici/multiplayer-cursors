import { colors } from "../lib/colors";

export function ColorPicker() {
  return (
    <ul id="color-picker">
      {colors.map((color, index) => (
        <li key={color.label}>
          <button
            className="color"
            data-color={index}
            style={{ backgroundColor: color.value }}
          >
            <span className="sr-only">{color.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
