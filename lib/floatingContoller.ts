let hide: (() => void) | null = null;
let show: (() => void) | null = null;

export const registerFloating = (hideFn: () => void, showFn: () => void) => {
  hide = hideFn;
  show = showFn;
};

export const hideFloating = () => hide?.();
export const showFloating = () => show?.();
