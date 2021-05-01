declare module '*.module.scss' {
  const content: { [className: string]: string; };
  export = content;
}

declare module '*.scss' {
  export { };
}

declare module "*.mp3" {
  const value: string;
  export default value;
}
