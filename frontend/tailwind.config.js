/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		},
		extend: {
			container: {
				padding: '0',
				center: true
			},
			colors: {
				primary: '#1F485B',
				secondary: '#f9f9f9'
			},
		},
	},
	plugins: [],
}