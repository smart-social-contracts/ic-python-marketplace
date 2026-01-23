

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BG2HBs39.js","_app/immutable/chunks/B2QSKqcC.js","_app/immutable/chunks/CpmAsExS.js","_app/immutable/chunks/C1FmrZbK.js"];
export const stylesheets = [];
export const fonts = [];
