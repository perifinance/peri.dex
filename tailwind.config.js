module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                serif: ['Montserrat', 'serif'],
            },
            fontSize: {
                'sm': ['0.875rem', {
                    letterSpacing: '0px',
                }],
                'xl': ['1.25rem', {
                    lineHeight: '2rem'    
                }],
            },
            colors: {
                blue: {
                    500: '#2184F8'
                },
                skyblue: {
                    500: '#13DFFF'
                },
                pink: {
                    500: '#EE22FF'
                },
                purple: {
                    500: '#9167FF'
                },
                red: {
                    500: '#CC4949'
                },
                black: '#151515',
                gray: {
                    900: '#151515',
                    700: '#212121',
                    500: '#333333',
                    300: '#737373',
                    200: '#fffff2'
                }
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}