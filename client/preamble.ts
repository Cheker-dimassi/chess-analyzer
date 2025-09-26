// @ts-nocheck
import RefreshRuntime from "/@react-refresh";

// Inject React Refresh globals
RefreshRuntime.injectIntoGlobalHook(window as any);
// @ts-ignore
window.$RefreshReg$ = () => {};
// @ts-ignore
window.$RefreshSig$ = () => (type: any) => type;
// @ts-ignore
window.__vite_plugin_react_preamble_installed__ = true;
