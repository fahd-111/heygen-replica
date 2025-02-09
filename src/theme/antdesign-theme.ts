// theme.ts
import { theme } from "antd";

export const antDesignThemeConfig = {
    algorithm: theme.darkAlgorithm,
    components: {

        Input: {
            "activeBorderColor": "rgba(145, 158, 171, 0.16)",
            "hoverBorderColor": "rgba(145, 158, 171, 0.26)",
            "colorBorder": "rgba(145, 158, 171, 0.16)",
            "colorPrimaryActive": "rgba(145, 158, 171, 0.16)",
            "colorPrimary": "rgba(145, 158, 171, 0.16)",
            "colorPrimaryHover": "rgba(145, 158, 171, 0.16)",
            "controlHeight": 48,
            "borderRadius": 8,
            "activeShadow": "0 0 0 2px rgba(145, 158, 171, 0.16)",
            "algorithm": true,
            "hoverBg": "rgba(223,223,223,0.11)",
            "colorText": "rgb(255,255,255)"
        },
        Select: {
            "colorPrimary": "rgba(145, 158, 171, 0.16)",
            "colorPrimaryHover": "rgba(145, 158, 171, 0.16)",
            "controlHeight": 48,
            "controlHeightLG": 48,
            "borderRadius": 8,
            "lineWidth": 2,
            "colorIconHover": "rgba(145, 158, 171, 0.16)",
            "colorBorder": "rgba(145, 158, 171, 0.16)",
            "colorText": "rgb(255,255,255)",
            "colorIcon": "rgb(255,255,255)",
            "colorTextPlaceholder": "rgba(255,255,255,0.35)",
        },
        "Divider": {
            "verticalMarginInline": 2,
            "textPaddingInline": "0.2em",
            "orientationMargin": 0,
            "marginLG": 1,
            "margin": 6
        },
        "Segmented": {
            "itemSelectedBg": "rgba(124,132,245,255)",
            "trackPadding": 5,
            "controlHeight": 39,
            "fontSize": 15
        },
        Button: {
            "defaultBg": "rgb(121,127,244)",
            "defaultHoverBg": "rgba(136,146,248,255)",
            "defaultHoverColor": "rgb(255,255,255)",
        }
    }
};
