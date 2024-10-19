module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-purple': '#32012F',
        'custom-brown': '#524C42',
        'custom-beige': '#E2DFD0',
        'custom-orange': '#F97300',

        'custom-black' : '#343131', 
        'custom-red' : '#A04747',
        'custom-pale-orange' : '#D8A25E' ,
        'custom-yellow' : '#EEDF7A' ,
      },
    },
  },
  plugins: [    require('tailwind-scrollbar'),
    
  ],
}


