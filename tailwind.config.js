/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0E0E18",  // Более темный оттенок, создающий ощущение глубины
        secondary: {
          DEFAULT: "#E68A00",  // Немного темнее, но по-прежнему яркий и выразительный
          100: "#D07C00",      // Теплый насыщенный оттенок
          200: "#C27500",      // Темнее, с более оранжевым тоном
        },
        black: {
          DEFAULT: "#000000",  // Оставляем абсолютный черный для контраста
          100: "#1A1A29",      // Более глубокий темный оттенок
          200: "#202030",      // Чуть светлее для дополнительного объема
        },
        gray: {
          100: "#B8B8CC",      // Светло-серый оттенок с легким холодным тоном для элегантности
        },
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
}
