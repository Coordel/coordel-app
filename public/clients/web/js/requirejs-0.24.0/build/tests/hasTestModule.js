define(function(a){var b,c,d,e,f,g;has("aTrueValue")?b="is true":b="is false",has("aFalseValue")?c="is true":c="is false",has("some skipped value")?d="what":d="ever",e=has("aTrueValue")?"OK":"FAIL",f=has("aFalseValue")?"FAIL":"OK",g=has("some skipped value")?"what":"ever";return b+c+d+e+f+g})