module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            keyframes: {
                "x-bounce": {
                    "0%, 100%": {
                        transform: "translateX(-25%)",
                        "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
                    },
                    "50%": {
                        transform: "translateX(0)",
                        "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
                    },
                },
                "r-fade-in": {
                    "0%": {transform: "translateX(100%)"},
                    "100%": {transform: "translateX(0)"},
                },
                "r-fade-out": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "fade-dn": {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                "fade-up": {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100%)' },
                },
                "move-dn": {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                "move-up": {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
            },
            animation: {
                "x-bounce": "x-bounce 1s infinite",
                "r-fade-in": "r-fade-in 1s",
                "r-fade-out": "r-fade-out 1s",
                "move-up": 'move-up .2s',
                "move-dn": 'move-dn .2s',
                "fade-up": 'fade-up .2s',
                "fade-dn": 'fade-dn .2s',
            },
            screens: {
                xs: "320px",
                ss: "440px",
            },
            minWidth: {
                5: "1.25rem",
                6: "1.5rem",
                7: "1.75rem",
                8: "2rem",
                9: "2.25rem",
                10: "2.5rem",
                11: "2.75rem",
                12: "3rem",
                14: "3.5rem",
                16: "4rem",
                18: "4.5rem",
                20: "5rem",
                21: "5.25rem",
                22: "5.5rem",
                23: "5.75rem",
                24: "6rem",
                52: "13rem",
                36: "9rem",
                80: "20rem",
                96: "24rem",
                128: "32rem",
                136: "34rem",
                144: "36rem",
                256: "64rem",
            },
            minHeight: {
                5: "1.25rem",
                6: "1.5rem",
                7: "1.75rem",
                8: "2rem",
                9: "2.25rem",
                10: "2.5rem",
                11: "2.75rem",
                12: "3rem",
                14: "3.5rem",
                16: "4rem",
                18: "4.5rem",
                20: "5rem",
                21: "5.25rem",
                22: "5.5rem",
                23: "5.75rem",
                24: "6rem",
                52: "13rem",
                36: "9rem",
                80: "20rem",
            },
            fontFamily: {
                sans: ["Graphik", "sans-serif"],
                serif: ["Montserrat", "serif"],
            },
            /* fontSize: {
                sm: [
                    ".875rem",
                    {
                        letterSpacing: "0px",
                    },
                ],
                xl: [
                    "1.25rem",
                    {
                        lineHeight: "2rem",
                    },
                ],
            }, */
            colors: {
                cyan: {
                    450: "#13dfff",
                    850: "#164e63",
                    900: "#031432",
                    950: "#042044",//"#031734", //"#041b36",
                },
                skyblue: {
                    500: "#13DFFF",
                    600: "#2cd3ed",
                    700: "#0e8497",
                    900: "#021030",
                    950: "#020e2f",
                },
                pink: {
                    500: "#EE22FF",
                },
                purple: {
                    500: "#9167FF",
                },
                red: {
                    400: "#ff4976",
                    500: "#CC4949",
                    700: "#CB0000",
                    950: "#221237",
                },
                yellow: {
                    500: "#F0B90B",
                },
                black: {
                    500: "#071E39",
                    900: "#151515",
                },
                blue: {
                    500: "#2184F8",
                    750: "#242a4b",
                    800: "#1c2345",
                    850: "#131832",
                    900: "#020a30",
                    950: "#01092c",
                },
                gray: {
                    700: "#212121",
                    500: "#333333",
                    450: "#848b96",
                    300: "#B1BAD7",
                    200: "#fffff2",
                },
                long: {
                    500: "#89F8CA",
                },
                short: {
                    500: "#ED6D87",
                },
            },
        },
    },
    plugins: [],
};
