// genericForm/inputs/index.ts
// Barrel exports para la carpeta inputs

export { InputCheckbox } from "./InputCheckbox";
export { InputHidden } from "./InputHidden";
export { InputNumber } from "./InputNumber";
export { InputRadio } from "./InputRadio";
export { InputSelect } from "./InputSelect";
// Inputs individuales (para uso directo si es necesario)
export { InputText } from "./InputText";
export { InputTextarea } from "./InputTextarea";
// Registry
export { getInputComponent, inputRegistry, registerInput } from "./registry";
// Tipos
export * from "./types";
// export { InputDatePicker } from "./InputDatePicker"; // Requires: npx shadcn@latest add calendar
