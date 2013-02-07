define(["dojo"], function(dojo) {

    return {
      
      smartText: function(text){
        //this function enters a line break for returns and linkifies urls/emails/etc
        var string = "";
        if (text){
           string = text.replace(/\n/g, "<br>");
           string = linkify(string);
        }
        return string;
      },

      linkify: function(text){
        var string = "";
        if (text){
          string = linkify(text);
        }
        return string;
      },
      
      breakify: function(text){
        var string = "";
        if (text) {
          string = text.replace(/\n/g, "<br>");
        }
        return string;
      }
        
    };
});