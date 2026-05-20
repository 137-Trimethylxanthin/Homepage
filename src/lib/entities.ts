export type ToolbarSpacerIcon = { kind: "spacer" };

export type ToolbarImageIcon = {
  kind: "image";
  src: string;
  alt: string;
};

export type ToolbarIcon = ToolbarSpacerIcon | ToolbarImageIcon;
