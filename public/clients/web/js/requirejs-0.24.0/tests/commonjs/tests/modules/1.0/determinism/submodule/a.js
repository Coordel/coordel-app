define(["require","exports","module","test","test","a"],function(a,b,c){var d=a("test"),e=!1,d=a("test");try{a("a")}catch(f){e=!0}d.assert(e,"require does not fall back to relative modules when absolutes are not available.")})