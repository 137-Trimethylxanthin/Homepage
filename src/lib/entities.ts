export type ToolbarSpacerIcon = { kind: "spacer" };

export type ToolbarWebdingsIcon = {
  kind: "webdings";
  value: string;
  ariaLabel: string;
};

export type ToolbarImageIcon = {
  kind: "image";
  src: string;
  alt: string;
};

export type ToolbarIcon =
  | ToolbarSpacerIcon
  | ToolbarWebdingsIcon
  | ToolbarImageIcon;
