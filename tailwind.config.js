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
                gray: {
                    200: '#fffff2'
                },
                blue: {
                    500: '#2184F8'
                },
                green: {
                    500: '#00F0FF'
                },
                red: {
                    500: '#CC4949'
                },
                black: '#151515',
                gray: {
                    900: '#151515',
                    700: '#212121',
                    500: '#333333',
                    300: '#737373'
                }
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}