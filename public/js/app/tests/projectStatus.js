dojo.provide("app.tests.projectStatus");

tests.register("app.tests.projectStatus",
	[
		{
			runTest: function(t){
				var expected = "<h1>Hello World</h1>";

				t.isNot(expected, "");
			}
		}
	]
);

