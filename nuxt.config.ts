// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  css: [
    "~/node_modules/bootstrap/dist/css/bootstrap.min.css"
  ],

  modules:  [
    ['@nuxtjs/google-fonts', {
      families: {
        'Lato': [200],
        Roboto: true,
        Inter: [400, 700],
        'Josefin+Sans': true,
        Raleway: {
          wght: [100, 400],
          ital: [100]
        },
        Inter: '200..700',
        'Crimson Pro': {
          wght: '200..900',
          ital: '200..700',
        },
        'Libre Baskerville': {
          wght: '200..900',
        },
        'Open Sans': {
          wght: '200..900',
        },
      }
  }],  
  ],
})
