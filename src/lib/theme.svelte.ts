let currentTheme = $state('win95');

export function getTheme(): string {
  return currentTheme;
}

export function setTheme(theme: string): void {
  currentTheme = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.className =
      document.documentElement.className
        .replace(/theme-\w+/g, '')
        .trim() + ` theme-${theme}`;
  }
}

export function initTheme(): void {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('theme-win95');
  }
}

export const THEMES = [
  { id: 'win95', name: 'Windows 95' },
  { id: 'winxp', name: 'Windows XP' },
];
