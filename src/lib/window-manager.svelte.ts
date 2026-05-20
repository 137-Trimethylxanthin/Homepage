import type { Component } from 'svelte';

export interface WindowConfig {
  id?: string;
  title: string;
  icon: string;
  component: Component;
  props?: Record<string, unknown>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: Component;
  props: Record<string, unknown>;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  restoreX: number;
  restoreY: number;
  restoreWidth: number;
  restoreHeight: number;
}

export const MIN_WIDTH = 200;
export const MIN_HEIGHT = 150;
export const TASKBAR_HEIGHT = 32;

let windows: WindowState[] = $state([]);
let nextZIndex = $state(100);
let idCounter = $state(0);
let desktopWidth = $state(0);
let desktopHeight = $state(0);
let cascadeX = $state(0);
let cascadeY = $state(0);

export function getWindows(): WindowState[] {
  return windows;
}

export function getActiveWindow(): WindowState | undefined {
  let active: WindowState | undefined;
  let maxZ = -1;
  for (const win of windows) {
    if (!win.minimized && win.zIndex > maxZ) {
      active = win;
      maxZ = win.zIndex;
    }
  }
  return active;
}

export function getHighestZIndex(): number {
  let maxZ = -1;
  for (const win of windows) {
    if (win.zIndex > maxZ) maxZ = win.zIndex;
  }
  return maxZ;
}

export function openWindow(config: WindowConfig): string {
  const id = config.id ?? `window-${++idCounter}`;

  // Guard against duplicate IDs - if window already exists, just focus it
  const existing = windows.find((w) => w.id === id);
  if (existing) {
    focusWindow(id);
    return id;
  }

  const x = config.x ?? cascadeX;
  const y = config.y ?? cascadeY;
  const width = config.width ?? 800;
  const height = config.height ?? 600;

  cascadeX = (cascadeX + 20) % 220;
  cascadeY = (cascadeY + 20) % 220;

  const newWindow: WindowState = {
    id,
    title: config.title,
    icon: config.icon,
    component: config.component,
    props: config.props ?? {},
    x,
    y,
    width,
    height,
    minimized: false,
    maximized: false,
    zIndex: nextZIndex++,
    restoreX: x,
    restoreY: y,
    restoreWidth: width,
    restoreHeight: height,
  };

  windows = [...windows, newWindow];
  return id;
}

export function closeWindow(id: string): void {
  windows = windows.filter((w) => w.id !== id);
}

export function minimizeWindow(id: string): void {
  windows = windows.map((w) =>
    w.id === id ? { ...w, minimized: !w.minimized } : w,
  );
}

export function toggleMaximize(id: string): void {
  const wScreen = desktopWidth || 1024;
  const hScreen = desktopHeight || 768;

  windows = windows.map((w) => {
    if (w.id !== id) return w;

    if (w.maximized) {
      return {
        ...w,
        x: w.restoreX,
        y: w.restoreY,
        width: w.restoreWidth,
        height: w.restoreHeight,
        maximized: false,
      };
    }

    return {
      ...w,
      restoreX: w.x,
      restoreY: w.y,
      restoreWidth: w.width,
      restoreHeight: w.height,
      x: 0,
      y: 0,
      width: wScreen,
      height: hScreen - TASKBAR_HEIGHT,
      maximized: true,
    };
  });
}

export function focusWindow(id: string): void {
  windows = windows.map((w) =>
    w.id === id ? { ...w, zIndex: nextZIndex++, minimized: false } : w,
  );
}

export function moveWindow(id: string, x: number, y: number): void {
  const wScreen = desktopWidth || 1024;
  const hScreen = desktopHeight || 768;
  const minVisible = 80; // keep at least 80px of title bar visible

  windows = windows.map((w) => {
    if (w.id !== id) return w;
    const clampedX = Math.max(minVisible - w.width, Math.min(wScreen - minVisible, x));
    const clampedY = Math.max(0, Math.min(hScreen - minVisible, y));
    return { ...w, x: clampedX, y: clampedY };
  });
}

export function resizeWindow(id: string, width: number, height: number): void {
  windows = windows.map((w) =>
    w.id === id
      ? {
          ...w,
          width: Math.max(MIN_WIDTH, width),
          height: Math.max(MIN_HEIGHT, height),
        }
      : w,
  );
}

export function setDesktopDimensions(w: number, h: number): void {
  desktopWidth = w;
  desktopHeight = h;
}
