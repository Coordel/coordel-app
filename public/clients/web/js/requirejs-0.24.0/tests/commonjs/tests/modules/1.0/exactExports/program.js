define(["require","exports","module","test","a"],function(a,b,c){var d=a("test"),e=a("a");d.assert(e.program()===b,"exact exports"),d.print("DONE","info")})