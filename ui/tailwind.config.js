/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Xoriant ORIAN brand colors
                'xoriant-navy': {
                    DEFAULT: '#1a1f3a',
                    light: '#2d3561',
                    dark: '#0f1220',
                },
                'xoriant-blue': {
                    DEFAULT: '#2563eb',
                    light: '#60a5fa',
                    dark: '#1e40af',
                },
                'xoriant-purple': {
                    DEFAULT: '#7c3aed',
                    light: '#a78bfa',
                    dark: '#5b21b6',
                },
                'xoriant-indigo': {
                    DEFAULT: '#4f46e5',
                    light: '#818cf8',
                    dark: '#3730a3',
                },
            },
            backgroundImage: {
                'xoriant-gradient': 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
                'xoriant-accent': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
