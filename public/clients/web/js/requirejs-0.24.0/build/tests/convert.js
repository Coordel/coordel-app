define(["commonJs"],function(a){doh.register("convert",[function b(b){var c='require.def("fake", {lol: "you guise"});',d="require.def(\"fake\", [],\nfunction(){\nreturn{lol : 'you guise'};\n});";b.is(c,a.convert("fake.js",c)),b.is(d,a.convert("fake.js",d))}]),doh.run()})