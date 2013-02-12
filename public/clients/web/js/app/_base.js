require({
  //baseUrl: 'clients/web/js/',
  baseUrl: 'clients/web/js/',

  // set the paths to our library packages
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

  // set the path for the require plugins text, i18n, etc
  paths: {
    text: 'requirejs-0.24.0/text',
    i18n: 'requirejs-0.24.0/i18n'
  }
}, ['app/base']);