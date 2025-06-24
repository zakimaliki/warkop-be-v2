import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './components/atoms/**/*.{js,ts,jsx,tsx,mdx}',
        './components/molecules/**/*.{js,ts,jsx,tsx,mdx}',
        './components/organisms/**/*.{js,ts,jsx,tsx,mdx}',
        './store/**/*.{js,ts,jsx,tsx,mdx}',
        './services/**/*.{js,ts,jsx,tsx,mdx}',
        './config/**/*.{js,ts,jsx,tsx,mdx}',
        './theme/**/*.{js,ts,jsx,tsx,mdx}',
        './apis/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};

export default config; 