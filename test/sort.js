var should = require('should');
var Sort = require('./../lib/sort');



describe('Sort', function(){

  var deliverables = [
     
    {
        "id": "3c0b0b22b121ab3c3ae522593c70553f",
        "name": "Textarea",
        "blockers": [
            "3c0b0b22b121ab3c3ae522593c705076"
        ]
    },
    {  
       "id": "3c0b0b22b121ab3c3ae522593c706b2f",
       "name": "Text Box",
       "blockers": [
          "3c0b0b22b121ab3c3ae522593c70553f"
       ]
     },
     {
       "id": "3c0b0b22b121ab3c3ae522593c705076",
       "name": "File"
      }
      
  ];
  
  
  describe('#byBlocking()', function(){
    it('should list them correctly', function(){
      var res = Sort.byBlocking(deliverables, {id: "id", field:"blockers"});
      /*
      console.log('0', res[0]);
      console.log('1', res[1]);
      console.log('2', res[2]);
      */
    });
    
          
  });
  
});
