({
  appDir: '../web/',

  baseUrl: 'js',

  dir: '/Users/Laptop/github/jitsu/coordel-app/public/clients/web',
  
  pragmas: {
    asynchLoader: true
  },

  locale: 'en-us',

  packages: [
    {
      name: 'dojo',
      location: 'dojo-release-1-1.6.1-src/dojo',
      main: 'lib/main-browser',
      lib: '.'
    },
    {
      name: 'dijit',
      location: 'dojo-release-1-1.6.1-src/dijit',
      main: 'lib/main',
      lib: '.'
    },
    {
      name: 'dojox',
      location: 'dojo-release-1-1.6.1-src/dojox',
      main: 'lib/main',
      lib: '.'
    }
  ],
  
  paths: {
    text : 'requirejs-0.24.0/text',
    i18n : 'requirejs-0.24.0/i18n'
  },

  modules: [
    {
      name: 'app/_base'
    }
  ]
})