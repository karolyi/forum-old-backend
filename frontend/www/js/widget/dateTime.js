(function($) {
  Forum.widget.dateTime = {
    options: {
      time: Math.floor(((new Date()).getTime()) / 1000),
      tooltip: {
        position: {
          my: 'bottom center',
          at: 'top center',
        },
        style: {
          classes: 'ui-tooltip-shadow ui-tooltip-rounded ui-tooltip-light ui-tooltip-forum'
        },
      },
    },

    _create: function() {
      // console.log((new Date()).getTimezoneOffset());
      var myTimeZone = (new Date()).getTimezoneOffset();
      if ($.Forum.DateTime.global._timeZoneSecsDiff === undefined)
        $.Forum.DateTime.global._timeZoneSecsDiff = (myTimeZone + Forum.settings.timeZoneDiff) * 60;
      if ($.Forum.DateTime.global.moduleInited === undefined) {
        $.Forum.DateTime.global.moduleInited = true;
        $.Forum.DateTime.startUpdate();
        $.Forum.DateTime._changeLanguage();
      }
      this.update();
      $.Forum.DateTime.instances.push(this);
      $.Widget.prototype._create.call(this);
    },

    destroy: function() {
      var elementIndex = $.Forum.DateTime.instances.indexOf(this);
      if (elementIndex != -1)
        $.Forum.DateTime.instances.splice(elementIndex, 1);
      $.Widget.prototype.destroy.call(this);
    },

    update: function() {
      this.element.html(this.shortDate());
      var tooltipOptions = this.options.tooltip;
      tooltipOptions.content = this.longDate();
      this.element.qtip(tooltipOptions);
//      console.log('updated to ' + this.longDate());
    },

    longDate:function() {
      var time = this.options.time;
      var thatTime = (new Date()).setTime(time * 1000);
      return dateFormat(thatTime, _('dddd, mmmm dd, yyyy, HH:MM:ss Z'))
    },

    shortDate: function() {
      var time = this.options.time;
      var timeWithTimeZone = time + $.Forum.DateTime.global._timeZoneSecsDiff; // Can be that its a subtraction, really
      var difference = $.Forum.DateTime.global._unixTimes['currTime'] - timeWithTimeZone;
      var thatTime = (new Date()).setTime(time * 1000);
      if (difference < 60)
        return _('less then a minute ago');
      if (difference < 3600)
        return sprintf(Forum.gettext.ngettext('%d minutes ago', '%s minutes ago'), Math.floor(difference / 60));
      if (difference > 3600 && difference < 7200)
        return _('about an hour ago');
      if (timeWithTimeZone > $.Forum.DateTime.global._unixTimes['oneDayBeforeBegin']) {
        // Calculate hours difference
        var hourValue = Math.floor(($.Forum.DateTime.global._unixTimes['currTime'] - timeWithTimeZone) / 3600);
        return sprintf(Forum.gettext.ngettext('%d hours ago', '%s hours ago', hourValue), hourValue);
      }
      if (timeWithTimeZone > $.Forum.DateTime.global._unixTimes['yesterdayBegin'])
        return dateFormat(thatTime, _('"Yesterday at" H:MM'));
      if (timeWithTimeZone > $.Forum.DateTime.global._unixTimes['fourDaysBeforeBegin'])
        return dateFormat(thatTime, _('ddd "at" H:MM'));
      if (timeWithTimeZone > $.Forum.DateTime.global._unixTimes['thisYearBegin'])
        return dateFormat(thatTime, _('mmm d "at" H:MM'));
      return dateFormat(thatTime, _('mmmm d, yyyy'));
    },

  };

  $.widget('Forum.DateTime', Forum.widget.dateTime);
  $.extend($.Forum.DateTime, {
    instances: new Array(),

    global: {
      _unixTimes: new Object(),
    },

    startUpdate: function() {
      if ($.Forum.DateTime.global._updateTimeoutId)
        clearTimeout($.Forum.DateTime.global._updateTimeoutId);
      var nowDate = new Date();
      var nextMinute = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), nowDate.getHours(), nowDate.getMinutes(), 60);
      var millisecs = nextMinute - nowDate;
      $.Forum.DateTime.global._updateTimeoutId = setTimeout('$.Forum.DateTime.startUpdate()', millisecs + 500); // Plus 500 for safety
      $.Forum.DateTime.calculateUnixTimes();
      $.Forum.DateTime.instances.forEach(function(widgetObj) {
        widgetObj.update();
      });
    },

    calculateUnixTimes: function() {
      var nowDate = new Date();
      $.Forum.DateTime.global._unixTimes['currTime'] = nowDate;
      $.Forum.DateTime.global._unixTimes['thisYearBegin'] = new Date(nowDate.getFullYear(), 0, 1, 0, 0, 0);
      $.Forum.DateTime.global._unixTimes['todayBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0);
      $.Forum.DateTime.global._unixTimes['yesterdayBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1, 0, 0, 0);
      $.Forum.DateTime.global._unixTimes['fourDaysBeforeBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 3, 0, 0, 0);
      $.Forum.DateTime.global._unixTimes['oneDayBeforeBegin'] = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1, nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds());
      // Translate all values to unix epoch seconds
      for (var key in $.Forum.DateTime.global._unixTimes)
        $.Forum.DateTime.global._unixTimes[key] = Math.floor($.Forum.DateTime.global._unixTimes[key].getTime() / 1000);
    },

    _changeLanguage: function() {
      dateFormat.i18n = {
        dayNames: [
          _("Sun"), _("Mon"), _("Tue"), _("Wed"), _("Thu"), _("Fri"), _("Sat"),
          _('Sunday'), _('Monday'), _('Tuesday'), _('Wednesday'), _('Thursday'), _('Friday'), _('Saturday')
        ],
        monthNames: [
          _("Jan"), _("Feb"), _("Mar"), _("Apr"), _("May_short"), _("Jun"), _("Jul"), _("Aug"), _("Sep"), _("Oct"), _("Nov"), _("Dec"),
          _('January'), _('February'), _('March'), _('April'), _('May'), _('June'), _('July'), _('August'), _('September'), _('October'), _('November'), _('December')
        ]
      };
      $.Forum.DateTime.instances.forEach(function(instance) {
        instance.update();
      });
    },


  });
})(jQuery)
