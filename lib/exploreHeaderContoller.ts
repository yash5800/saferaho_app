
let hide: (() => void) | null = null;
let show: (() => void) | null = null;

export const registerExploreHeader = (
  hideFn: () => void,
  showFn: () => void
) => {
  hide = hideFn;
  show = showFn;
};

export const hideExploreHeader = () => hide?.();
export const showExploreHeader = () => show?.();
