module.exports = {
  //keys for authenticating with providers
  auth : {
    fb: {
      appId: '145674338818252', 
      appSecret: '937018cf2c75b9eaced798864f7f4ebd'
    }, 
    twitter: {
      consumerKey: 'ofbkKDfUpLqBQHakhdBytw', 
      consumerSecret: 'GM3lLmIaKVGUddiU65G4MMrG9pMfNGN8pVuVcNSiCoU'
    }, 
    linkedin: {
      apiKey: 'uaq9f87fwvkp', 
      apiSecret: '2AhwrRhR2KkCfJSh'
    }, 
    google: {
      clientId: '570025906568.apps.googleusercontent.com', 
      clientSecret: 'wBCkg3nW9-hgwmVlP8V6_DDc'
    }
  },
  //config parameters
  config : {
    redisOptions:{
      host: "viperfish.redistogo.com",
      port: 10130,
      db: "coordel",
      expressSessionPrefix: "sessions",
      auth: "313b4da5e2267e3faa2db3b0bc9bcb0b"
    },
    couchOptions:{
      host: "localhost",
      port: 5984,
      auth: { username: 'admin', password: 'password' }
    },
    couchName: "coordel",
    logglyOptions: {
      subdomain: "coordel",
      auth: {
        username: "coordelloggly",
        password: "coordel1129"
      }
    }
  },
  
  //site settings
  //when allow full and limited access are false, only admins are allowed access to the app
  allowFullAccess: false,
  
  //when limited access is true, then only admins and users who have received an invite are allowed
  allowLimitedAccess: false, 
  
  //when true, allowed users can log in via google, linkedin, and facebook
  allowProviderLogin: false,
  
  admins: []
    
};