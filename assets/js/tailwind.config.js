/**
 * BIG O — Design tokens for Tailwind (Play CDN)
 * -----------------------------------------------------------------------
 * Shared between index.html (landing) and dashboard.html (console).
 * Extracted as-is from the original Stitch export — values are unchanged.
 * See /docs/DESIGN.md for the human-readable design system description.
 */
try {
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                "colors": {
                    "secondary-fixed": "#dfe2eb",
                    "surface-tint": "#00dbe9",
                    "surface": "#051424",
                    "surface-container-high": "#1c2b3c",
                    "surface-container": "#122131",
                    "tertiary-fixed": "#d8e3fb",
                    "primary-container": "#00f0ff",
                    "secondary-fixed-dim": "#c3c6cf",
                    "on-secondary-container": "#b5b8c1",
                    "surface-container-lowest": "#010f1f",
                    "primary": "#dbfcff",
                    "on-error-container": "#ffdad6",
                    "secondary": "#c3c6cf",
                    "on-surface-variant": "#b9cacb",
                    "background": "#051424",
                    "primary-fixed": "#7df4ff",
                    "on-tertiary-container": "#545f73",
                    "error": "#ffb4ab",
                    "tertiary": "#f4f6ff",
                    "inverse-surface": "#d4e4fa",
                    "outline-variant": "#3b494b",
                    "on-secondary-fixed": "#181c22",
                    "inverse-primary": "#006970",
                    "on-primary-fixed": "#002022",
                    "outline": "#849495",
                    "surface-bright": "#2c3a4c",
                    "surface-container-highest": "#273647",
                    "on-primary-container": "#006970",
                    "on-tertiary-fixed": "#111c2d",
                    "tertiary-container": "#cfdaf2",
                    "on-primary-fixed-variant": "#004f54",
                    "on-tertiary-fixed-variant": "#3c475a",
                    "on-tertiary": "#263143",
                    "on-primary": "#00363a",
                    "tertiary-fixed-dim": "#bcc7de",
                    "on-secondary-fixed-variant": "#43474e",
                    "error-container": "#93000a",
                    "on-error": "#690005",
                    "secondary-container": "#454950",
                    "on-surface": "#d4e4fa",
                    "inverse-on-surface": "#233143",
                    "surface-container-low": "#0d1c2d",
                    "primary-fixed-dim": "#00dbe9",
                    "surface-dim": "#051424",
                    "surface-variant": "#273647",
                    "on-secondary": "#2d3137",
                    "on-background": "#d4e4fa"
                },
                "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
                },
                "spacing": {
                    "stack-lg": "32px",
                    "container-margin": "24px",
                    "unit": "4px",
                    "gutter": "16px",
                    "stack-sm": "8px",
                    "stack-md": "16px"
                },
                "fontFamily": {
                    "code-sm": ["JetBrains Mono"],
                    "body-sm": ["Inter"],
                    "headline-md": ["Geist"],
                    "body-md": ["Inter"],
                    "title-sm": ["Inter"],
                    "label-xs": ["Inter"],
                    "display-lg": ["Geist"]
                },
                "fontSize": {
                    "code-sm": ["13px", {"lineHeight": "18px", "fontWeight": "450"}],
                    "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-md": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "title-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
                    "label-xs": ["11px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}],
                    "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
                }
            },
        },
    }
} catch (_e) {}
