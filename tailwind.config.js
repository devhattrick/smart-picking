/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- บรรทัดนี้ต้องมีเครื่องหมาย {} และไม่มีการสะกดผิด
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans Thai', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6', // สีม่วงหลัก
          600: '#7c3aed', // สีม่วงเข้ม (เวลา Hover)
          700: '#6d28d9',
        }
      }
    },
  },
  plugins: [],
}
