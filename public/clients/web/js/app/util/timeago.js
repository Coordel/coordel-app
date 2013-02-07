/*
 * timeago for Dojo - based on the timeago jQuery plugin version 0.9.3
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright © 2011, Tom Elliott (mrtom [at] telliott [dot] net)
 */
define("ozo/timeago", [
  "dojo",
  "i18n!app/nls/coordel"], function(dojo, coordel) {
  dojo.declare("ozo.timeago", null, {

    settings: null,
    _data: {},

    _counter: 0, // you should only access this via the objects prototype

    constructor: function(query) {
        this._query = query;
        
        this.settings = {
            refreshMillis: 60000,
            allowFuture: false
        };
        
        this.settings.strings = coordel.timeago;
        
        // Fix for IE6 suckage
        document.createElement("abbr");
        document.createElement("time");
        
        //console.debug("in timeago", this);
        
        this._refresh();
        
        if (this.settings.refreshMillis > 0) {
            setInterval(dojo.hitch(this, this._refresh), this.settings.refreshMillis);
        }
    },
    
    _refresh: function() {
        var dh = dojo.hitch;
        dojo.query(this._query).forEach(dh(this, function(node) {
            var id = dojo.attr(node, 'id');
            if(!id) {
                id = 'timeago_'+ozo.timeago.prototype._counter;
                dojo.attr(node, 'id', id);
            }

            if(!this._data[id]) {
                ozo.timeago.prototype._counter++;
                this._data[id] = { 'datetime': this._getDatetime(node) };
                var text = dojo.trim(node.innerHTML); // TODO: Deal with inner nodes here
                if(text.length > 0) {
                    dojo.attr(node, "title", text);
                }
            }
            
            var data = this._data[id];
            if(!isNaN(data.datetime)) {
                node.innerHTML = this._inWords(data.datetime);
            }
        }));
    },
    
    _getDatetime: function(/* element */ node) {
        var isTimeNode = node.tagName.toLowerCase() === 'time';
        var iso8601 = isTimeNode ? dojo.attr(node, "datetime") : dojo.attr(node, "title");
        return this._parse(iso8601);
    },
    
    _parse: function(/* ISO 8601 String*/ isoTime) {
        var s = dojo.trim(isoTime);
        s = s.replace(/\.\d\d\d+/,""); // remove milliseconds
        s = s.replace(/-/,"/").replace(/-/,"/");
        s = s.replace(/T/," ").replace(/Z/," UTC");
        s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
        return new Date(s);
    },
    
    _inWords: function(/* Date object */ date) {
        var distance = this._distance(date);
        var txt = this.settings.strings;
        
        var prefix = txt.prefixAgo;
        var suffix = txt.suffixAgo;
        if(this.settings.allowFuture && distance < 0) {
            prefix = txt.prefixFromNow;
            suffix = txt.suffixFromNow;
            distance = Math.abs(distance);
        }
        
        var seconds = distance / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;
        
        function substitute(/* string or function */ sub, number) {
            var s = dojo.isFunction(sub) ? sub(number, distance) : sub;
            var value = (txt.numbers && txt.numbers[number]) || number;
            return s.replace(/%d/i, value);
        }
        
        var words = seconds < 45 && substitute(txt.seconds, Math.round(seconds)) ||
            seconds < 90 && substitute(txt.minute, 1) ||
            minutes < 45 && substitute(txt.minutes, Math.round(minutes)) ||
            minutes < 90 && substitute(txt.hour, 1) ||
            hours < 24 && substitute(txt.hours, Math.round(hours)) ||
            hours < 48 && substitute(txt.day, 1) ||
            days < 30 && substitute(txt.days, Math.floor(days)) ||
            days < 60 && substitute(txt.month, 1) ||
            days < 365 && substitute(txt.months, Math.floor(days / 30)) ||
            years < 2 && substitute(txt.year, 1) ||
            substitute(txt.years, Math.floor(years));

      return dojo.trim([prefix, words, suffix].join(" "));
    },
    
    _distance: function(/* Date object */ date) {
        return (new Date().getTime() - date.getTime());
    }
    
});

return ozo.timeago;
});

