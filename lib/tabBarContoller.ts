
let hide: (() => void) | null = null;
let show: (() => void) | null = null;

export const registerTabBar = (
  hideFn: () => void,
  showFn: () => void
) => {
  hide = hideFn;
  show = showFn;
};

export const hideTabBar = () => hide?.();
export const showTabBar = () => show?.();
