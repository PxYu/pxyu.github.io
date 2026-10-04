// Internal default. Set to false to restore the classic page styling.
const PIXEL_STYLE_ENABLED = true;

// Hidden URL overrides make the two styles easy to compare.
const styleOverride = new URLSearchParams(window.location.search).get('style');
window.siteConfig = {
  pixelStyle: styleOverride === 'classic' ? false
    : styleOverride === 'pixel' ? true
      : PIXEL_STYLE_ENABLED,
};
