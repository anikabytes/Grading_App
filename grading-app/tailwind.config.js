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
      },
    },
  },
  plugins: [    require('tailwind-scrollbar'),
    
  ],
}


