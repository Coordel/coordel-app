define(["dojo", "dojo/date/locale", "i18n!app/nls/coordel", "dojo/date/stamp"], function(dojo, dt, coordel, stamp) {
    //these functions return an object that has the formatted string
    //date is the string that is stored in couch
    var now = new Date();
    return {
      prettyISODate: function(date, showTime){
        now = new Date();
        //console.debug("date sent to prettyISODate", date);
        
        //take care that empty strings or null just get returned
        try {
          if (date === "" || date === null){
            return "";
          }

          var d = stamp.fromISOString(date),
              toReturn = "",
              format = "",
              thisYr = now.getYear(),
              dtYr = 0;

          if (d.getYear()){
            dtYr = d.getYear();
          }

          if (thisYr === dtYr){
            //if the date is this year, return MMM dd
            format = {datePattern: "MMM d", selector: "date"};
            if (showTime){
              format = {datePattern: "MMM d, hh:mm", selector: "date"};
            }
          } else {
            //if the date is not this year, return MMM dd, yyyy
            format = {formatLength: "medium", selector: "date"};
          }

          return  dt.format(d,format);
        } catch (err) {
          console.debug("ERROR getting pretty iso date", err, date);
          return "";
        }
      },
      prettyISODateTime: function(date){
        //console.debug("date sent to prettyISODate", date);
        //take care that empty strings or null just get returned
        if (date === "" || date === null){
          return "";
        }
        
        var d = stamp.fromISOString(date),
            toReturn = "",
            format = "",
            thisYr = now.getYear(),
            dtYr = 0;
            
        if (d.getYear()){
          dtYr = d.getYear();
        }
        if (thisYr === dtYr){
          //if the date is this year, return MMM dd hh:mm
          format = {datePattern: "MMM d"};
        } else {
          //if the date is not this year, return MMM dd, yyyy
          format = {formatLength: "medium"};
        }
          
        return  dt.format(d,format);
      },
      
      ago: function(isoString){
        this.settings = {
            refreshMillis: 60000,
            allowFuture: false
        };
        
        this.settings.strings = coordel.timeago; 
      
        return this._inWords(stamp.fromISOString(isoString));
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
      },
      
      deferred: function(date){
        now = new Date();
        //take care that empty strings or null just get returned
        if (date === "" || date === null){
          return "";
        }
        
        
        
        //return day of week by default
        var format = {datePattern:"EEEE", selector: "date"},
            dtWk = (stamp.fromISOString(date)),
            thisYr = now.getYear(),
            dtYr = (stamp.fromISOString(date)).getYear();

        //if it isn't this week, return Month and Day
   
        if (dojo.date.difference(now, dtWk, "week")>0){
          if (thisYr === dtYr){
            //if the date is this year, return MMM dd
            format = {datePattern: "MMM d", selector: "date"};
          } else {
            //if the date is not this year, return MMM dd, yyyy
            format = {formatLength: "medium", selector: "date"};
          }   
        }
        //console.debug("deferred", dt.format(stamp.fromISOString(date),format));
        return dt.format(stamp.fromISOString(date),format);
      },
      
      deadline: function(date, showTime){
        now = new Date();
        //take care that empty strings or null just get returned
        if (date === "" || date === null){
          return "";
        }
        
        
        //if the deadline hasn't past, then figure out how many days left
        var d = new Date(stamp.fromISOString(date)),
            compare = dojo.date.compare(d, now, "date"),
            toReturn = "",
            format = "",
            thisYr = now.getYear(),
            diff = 0,
            dtYr = 0;
            
        //console.debug ("deadline in dateFormat", date, d);
            
        if (d.getYear()){
          dtYr = d.getYear();
        }
            
        //console.debug("compare: ", compare, d, now);
        
        if (compare > 0){
          
          diff = dojo.date.difference(now,d,"day");
          
          //console.debug("the deadline is to come",now, d, diff, showTime);
          toReturn = diff.toString() + " " + coordel.metainfo.daysLeft;
          if (diff === 0){
            if (showTime){
              
              hrs = dojo.date.difference(now,d,"hour");
              mins = dojo.date.difference(now,d,"minute");
              
              
            
              mins = mins % 60;
              
              //console.log("mins", mins);
              toReturn = hrs.toString() + ":" + dojo.string.pad(mins.toString(), 2, "0") + " " + coordel.metainfo.left;
            } else {
              toReturn = coordel.metainfo.today;
            }
          }
          if (diff === 1){
            toReturn = diff.toString() + " " + coordel.metainfo.dayLeft;
          }
          //console.debug("toReturn in compare > 0", toReturn);
          if (diff > 14){
            if (thisYr === dtYr){
              //if the date is this year, return MMM dd
              format = {datePattern: "MMM d", selector: "date"};
              if (showTime){
                format = {datePattern: "MMM d, hh:mm", selector: "date"};
              }
            } else {
              //if the date is not this year, return MMM dd, yyyy
              format = {formatLength: "medium", selector: "date"};
            }
            toReturn = dt.format(d,format);
          }
          //deadline is coming up
          //if the more than 14 days, give a MMM dd
        
        } else if (compare === 0){
          //deadline is today
          //console.debug("the deadline is today");
          if (showTime){
            hrs = dojo.date.difference(now,d,"hour");
            mins = dojo.date.difference(now,d,"minute");
            
            var hString = "",
                mString = "";
            
            mins = mins % 60;
            
            if (hrs > 1){
              hString = hrs.toString() + " " + coordel.metainfo.hrs;
              
            } else if (hrs === 1){
              
              hString = hrs.toString() + " " + coordel.metainfo.hr;
              
            }
            
            if (mins > 9){
              mString =  dojo.string.pad(mins.toString(), 2, "0") + " " + coordel.metainfo.mins;
            } else if (mins > 0 && mins <= 9){
              mString =  mins.toString() + " " + coordel.metainfo.mins;
            } else if (mins === 0){
              mString =  mins.toString() + " " + coordel.metainfo.min;
            }
            //console.log("mins",now, d, mins);
            
            
            
            toReturn = hString + " " + mString + " " + coordel.metainfo.left;
          } else {
            toReturn = coordel.metainfo.today;
          }
        
        } else if (compare < 0){
          //console.debug("the deadline is past");
          diff = dojo.date.difference(d,now,"day");
          toReturn = diff.toString() + " " + coordel.metainfo.daysLate;
          /*
          if (diff === 0){
            toReturn === coordel.metainfo.today;
          }
          */
          if (diff === 1){
            toReturn = diff.toString() + " " + coordel.metainfo.dayLate;
          }
          //console.debug("toReturn", toReturn);
          if (diff > 14){
            if (thisYr === dtYr){
              //if the date is this year, return MMM dd
              format = {datePattern: "MMM d", selector: "date"};
              if (showTime){
                format = {datePattern: "MMM d, hh:mm", selector: "date"};
              }
            } else {
              //if the date is not this year, return MMM dd, yyyy
              format = {formatLength: "medium", selector: "date"};
            }
            toReturn = dt.format(d,format);
          }
    
        }
        return toReturn;
      }

    };
  }
);