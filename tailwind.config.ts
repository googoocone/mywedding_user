/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          // 대표 컬러
          primary: '#FFE4DE',
          secondary: '#FF767B',
          lgithgray : '#F2F2F2',

          // 공통 컬러 (semantic colors)
          success: '#38c172',
          error: '#e3342f',
          warning: '#ffed4a',
          info: '#6cb2eb',
        },
        fontFamily: {
            'noto-sans-kr': ['Noto Sans KR', 'sans-serif'],
          },
      },
    },
    plugins: [],
  }