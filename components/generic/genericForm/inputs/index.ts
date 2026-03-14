// genericForm/inputs/index.ts
// Barrel exports para la carpeta inputs

export { InputCheckbox } from "./InputCheckbox";
export { InputHidden } from "./InputHidden";
export { InputNumber } from "./InputNumber";
export { InputRadio } from "./InputRadio";
export { InputSelect } from "./InputSelect";
export { InputText } from "./InputText";
export { InputTextarea } from "./InputTextarea";
export { InputDatePicker } from "./InputDatePicker";
export { InputImage } from "./InputImage";
export { getInputComponent, inputRegistry, registerInput } from "./registry";

export * from "./types";
