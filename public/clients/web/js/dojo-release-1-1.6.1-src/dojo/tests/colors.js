dojo.provide("tests.colors"),dojo.require("dojo.colors"),function(){var a=function(a,b,c){var b=new dojo.Color(b),c=new dojo.Color(c);a.is(c.toRgba(),b.toRgba()),dojo.forEach(b.toRgba(),function(b){a.is("number",typeof b)})};doh.register("tests.colors",[function b(b){a(b,"black",[0,0,0])},function c(b){a(b,"white",[255,255,255])},function d(b){a(b,"maroon",[128,0,0])},function e(b){a(b,"olive",[128,128,0])},function f(b){a(b,"#f00","red")},function g(b){a(b,"#ff0000","red")},function h(b){a(b,"rgb(255, 0, 0)","red")},function i(b){a(b,"rgb(100%, 0%, 0%)","red")},function j(b){a(b,"rgb(300, 0, 0)","red")},function k(b){a(b,"rgb(255, -10, 0)","red")},function l(b){a(b,"rgb(110%, 0%, 0%)","red")},function m(b){a(b,"rgba(255, 0, 0, 1)","red")},function n(b){a(b,"rgba(100%, 0%, 0%, 1)","red")},function o(b){a(b,"rgba(0, 0, 255, 0.5)",[0,0,255,.5])},function p(b){a(b,"rgba(100%, 50%, 0%, 0.1)",[255,128,0,.1])},function q(b){a(b,"hsl(0, 100%, 50%)","red")},function r(b){a(b,"hsl(120, 100%, 50%)","lime")},function s(b){a(b,"hsl(120, 100%, 25%)","green")},function t(b){a(b,"hsl(120, 100%, 75%)","#80ff80")},function u(b){a(b,"hsl(120, 50%, 50%)","#40c040")},function v(b){a(b,"hsla(120, 100%, 50%, 1)","lime")},function w(b){a(b,"hsla(240, 100%, 50%, 0.5)",[0,0,255,.5])},function x(b){a(b,"hsla(30, 100%, 50%, 0.1)",[255,128,0,.1])},function y(b){a(b,"transparent",[0,0,0,0])},function z(b){a(b,dojo.colors.makeGrey(5),[5,5,5,1])},function A(b){a(b,dojo.colors.makeGrey(2,.3),[2,2,2,.3])}])}()