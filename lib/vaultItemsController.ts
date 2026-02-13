let open: (() => void) | null = null;

export const registerVaultItems = (openFn: () => void) => {
  open = openFn;
};

export const openVaultItems = () => open?.();
