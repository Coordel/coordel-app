dojo.provide("tests._base.array"),tests.register("tests._base.array",[function testIndexOf(a){var b=[128,256,512],c=["aaa","bbb","ccc"];a.assertEqual(1,dojo.indexOf([45,56,85],56)),a.assertEqual(1,dojo.indexOf([Number,String,Date],String)),a.assertEqual(1,dojo.indexOf(b,b[1])),a.assertEqual(2,dojo.indexOf(b,b[2])),a.assertEqual(1,dojo.indexOf(c,c[1])),a.assertEqual(2,dojo.indexOf(c,c[2])),a.assertEqual(-1,dojo.indexOf({a:1},"a")),b.push(c),a.assertEqual(3,dojo.indexOf(b,c))},function testIndexOfFromIndex(a){var b=[128,256,512],c=["aaa","bbb","ccc"];a.assertEqual(-1,dojo.indexOf([45,56,85],56,2)),a.assertEqual(1,dojo.indexOf([45,56,85],56,1)),a.assertEqual(1,dojo.indexOf([45,56,85],56,-1)),a.assertEqual(-1,dojo.indexOf([45,56,85],56,3))},function testLastIndexOf(a){var b=[128,256,512],c=["aaa","bbb","aaa","ccc"];a.assertEqual(1,dojo.indexOf([45,56,85],56)),a.assertEqual(1,dojo.indexOf([Number,String,Date],String)),a.assertEqual(1,dojo.lastIndexOf(b,b[1])),a.assertEqual(2,dojo.lastIndexOf(b,b[2])),a.assertEqual(1,dojo.lastIndexOf(c,c[1])),a.assertEqual(2,dojo.lastIndexOf(c,c[2])),a.assertEqual(2,dojo.lastIndexOf(c,c[0]))},function testLastIndexOfFromIndex(a){a.assertEqual(1,dojo.lastIndexOf([45,56,85],56,1)),a.assertEqual(-1,dojo.lastIndexOf([45,56,85],85,1)),a.assertEqual(-1,dojo.lastIndexOf([45,56,85],85,-1)),a.assertEqual(0,dojo.lastIndexOf([45,56,45],45,0))},function testForEach(a){var b=[128,"bbb",512];dojo.forEach(b,function(b,c,d){switch(c){case 0:a.assertEqual(128,b);break;case 1:a.assertEqual("bbb",b);break;case 2:a.assertEqual(512,b);break;default:a.assertTrue(!1)}});var c=!0;try{dojo.forEach(undefined,function(){})}catch(d){c=!1}a.assertTrue(c)},function testForEach_str(a){var b="abc";dojo.forEach(b,function(b,c,d){switch(c){case 0:a.assertEqual("a",b);break;case 1:a.assertEqual("b",b);break;case 2:a.assertEqual("c",b);break;default:a.assertTrue(!1)}})},function testForEach_string_callback(a){var b=[128,"bbb",512],c={_res:""};dojo.forEach(b,"this._res += item",c),a.assertEqual(c._res,"128bbb512"),c._res=[],dojo.forEach(b,"this._res.push(index)",c),a.assertEqual(c._res,[0,1,2]),c._res=[],dojo.forEach(b,"this._res.push(array)",c),a.assertEqual(c._res,[[128,"bbb",512],[128,"bbb",512],[128,"bbb",512]]);var d=!1;try{dojo.forEach(b,"this._res += arr[i];",c)}catch(e){d=!0}a.assertTrue(d);return},function testEvery(a){var b=[128,"bbb",512];a.assertTrue(dojo.every(b,function(b,c,d){a.assertEqual(Array,d.constructor),a.assertTrue(dojo.isArray(d)),a.assertTrue(typeof c=="number"),c==1&&a.assertEqual("bbb",b);return!0})),a.assertTrue(dojo.every(b,function(b,c,d){switch(c){case 0:a.assertEqual(128,b);return!0;case 1:a.assertEqual("bbb",b);return!0;case 2:a.assertEqual(512,b);return!0;default:return!1}})),a.assertFalse(dojo.every(b,function(b,c,d){switch(c){case 0:a.assertEqual(128,b);return!0;case 1:a.assertEqual("bbb",b);return!0;case 2:a.assertEqual(512,b);return!1;default:return!0}}))},function testEvery_str(a){var b="abc";a.assertTrue(dojo.every(b,function(b,c,d){switch(c){case 0:a.assertEqual("a",b);return!0;case 1:a.assertEqual("b",b);return!0;case 2:a.assertEqual("c",b);return!0;default:return!1}})),a.assertFalse(dojo.every(b,function(b,c,d){switch(c){case 0:a.assertEqual("a",b);return!0;case 1:a.assertEqual("b",b);return!0;case 2:a.assertEqual("c",b);return!1;default:return!0}}))},function testSome(a){var b=[128,"bbb",512];a.assertTrue(dojo.some(b,function(b,c,d){a.assertEqual(3,d.length);return!0})),a.assertTrue(dojo.some(b,function(a,b,c){if(b<1)return!0;return!1})),a.assertFalse(dojo.some(b,function(a,b,c){return!1})),a.assertTrue(dojo.some(b,function(b,c,d){a.assertEqual(Array,d.constructor),a.assertTrue(dojo.isArray(d)),a.assertTrue(typeof c=="number"),c==1&&a.assertEqual("bbb",b);return!0}))},function testSome_str(a){var b="abc";a.assertTrue(dojo.some(b,function(b,c,d){a.assertEqual(3,d.length);switch(c){case 0:a.assertEqual("a",b);return!0;case 1:a.assertEqual("b",b);return!0;case 2:a.assertEqual("c",b);return!0;default:return!1}})),a.assertTrue(dojo.some(b,function(b,c,d){switch(c){case 0:a.assertEqual("a",b);return!0;case 1:a.assertEqual("b",b);return!0;case 2:a.assertEqual("c",b);return!1;default:return!0}})),a.assertFalse(dojo.some(b,function(a,b,c){return!1}))},function testFilter(a){var b=["foo","bar",10];a.assertEqual(["foo"],dojo.filter(b,function(a,b,c){return b<1})),a.assertEqual(["foo"],dojo.filter(b,function(a,b,c){return a=="foo"})),a.assertEqual([],dojo.filter(b,function(a,b,c){return!1})),a.assertEqual([10],dojo.filter(b,function(a,b,c){return typeof a=="number"}))},function testFilter_str(a){var b="thinger blah blah blah";a.assertEqual(["t","h","i"],dojo.filter(b,function(a,b,c){return b<3})),a.assertEqual([],dojo.filter(b,function(a,b,c){return!1}))},function testMap(a){a.assertEqual([],dojo.map([],function(){return!0})),a.assertEqual([1,2,3],dojo.map(["cat","dog","mouse"],function(a,b,c){return b+1}))}])