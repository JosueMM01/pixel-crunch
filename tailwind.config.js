import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Fira Code"', ...defaultTheme.fontFamily.sans],
				mono: ['"Fira Code"', ...defaultTheme.fontFamily.mono],
			},
			colors: {
				// Tema Monokai (Oscuro)
				'monokai-bg': '#272822',
				'monokai-fg': '#F8F8F2',
				'monokai-pink': '#F92672',
				'monokai-green': '#A6E22E',
				'monokai-yellow': '#E6DB74',
				'monokai-purple': '#AE81FF',
				'monokai-cyan': '#66D9EF',
				'monokai-orange': '#FD971F',
				// Marca (Claro/Oscuro)
				'brand-blue': '#2563EB',
				// Acentos propuestos (CTA)
				'brand-cyan': '#1EAEDB',
				'brand-cyan-light': '#66D9EF',
				'brand-purple': '#7C5CE4',
				'brand-purple-light': '#AE81FF',
				'brand-pink': '#C2175A',
				'brand-pink-light': '#F92672',
				'brand-green': '#7FBF1E',
				'brand-green-light': '#A6E22E',
				'brand-yellow': '#E6DB74',
			},
		},
	},
	plugins: [],
};
