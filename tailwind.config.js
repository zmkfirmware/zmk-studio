/** @type {import('tailwindcss').Config} */
import trac from "tailwindcss-react-aria-components";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "sans": ["Montserrat", "system-ui"]
      },
      colors: {
        "primary": "light-dark(#3f3fcf, #3030c0)",
        "secondary": "light-dark(#a46de3, #531c92)",
        "accent": "light-dark(#12aff3, #0caaed)",
        "text-base": "light-dark(#212121, #dedede)",
        "bg-base": "light-dark( #e8e8e8, #171717)"
      }
    },

    fontFamily: {
      "keycap": ["OpenGorton", "Montserrat"]
    }
  },
  plugins: [
    trac({prefix: 'rac'})
  ],
}
