define(["require","exports","module","test","a"],function(a,b,c){var d=a("test");d.assert(a("a").foo()==1,"transitive"),d.print("DONE","info")})