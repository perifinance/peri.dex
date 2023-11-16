/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        minWidth: {
            12: "3rem",
            52: "13rem",
            36: "9rem",
            80: "20rem",
        },
        extend: {
            maxHeight: {
                524: "524px",
                640: "35rem",
                666: "41rem",
            },
            fontFamily: {
                sans: ["Graphik", "sans-serif"],
                serif: ["Montserrat", "serif"],
            },
            fontSize: {
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
            },
            colors: {
                blue: {
                    500: "#2184F8",
                },
                teal: "#4dc0b5",
                "teal-lighter": "#a0f0ed",
                skyblue: {
                    500: "#13DFFF",
                    600: "#2cd3ed",
                    700: "#0e8497",
                },
                pink: {
                    500: "#EE22FF",
                },
                purple: {
                    500: "#9167FF",
                },
                red: {
                    500: "#CC4949",
                    700: "#CB0000",
                },
                yellow: {
                    500: "#F0B90B",
                },
                black: {
                    500: "#071E39",
                    900: "#151515",
                },
                gray: {
                    700: "#212121",
                    500: "#333333",
                    300: "#737373",
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
