(function($) {
  Forum.widget.userName = {
    _create: function() {
      var self = this;
      this.element.html('<img src="/skins/' + Forum.settings.usedSkin + '/images/ajax-loader-small.gif" alt="' + _('Loading, please wait ...') +  '" title="' + _('Loading, please wait ...') +  '"/>');
      if (this.options.id == null && this.options.userObj == null)
        this.element.html('<img src="/skins/' + Forum.settings.usedSkin + '/images/icon-error.png" alt="' + _('Failure at initialization!') +  '" title="' + _('Failure at initialization!') +  '"/>');
      else {
        if (this.options.userObj == null) {
          $.when(
            Forum.controller.user.get([this.options.id])
          ).then(function(userObjArray) {
            self.options.userObj = userObjArray[self.options.id];
            self._initTooltip();
            this.element.text(this.options.userObj.name);
          });
        } else {
          this.options.id = this.options.userObj.id;
          this._initTooltip();
          this.element.text(this.options.userObj.name);
        }
      }
      $.Forum.UserName.instances.push(this);
      $.Widget.prototype._create(this);
    },

    _initTooltip: function() {
      var self = this;
      var tooltipOptions = this.options.tooltip;
      tooltipOptions.content = {
        text: Forum.utils.htmlEntities(self.options.userObj.quote) || '-',
      }
      this.element.qtip(tooltipOptions);
    },

    _update: function(userId) {
      // If the update is for this user, update the widget
      if (userId == this.options.userObj.id) {
        this.element.text(this.options.userObj.name);
        this.element.qtip('api').set('content.text', Forum.utils.htmlEntities(this.options.userObj.quote) || '-');
      }
    },

    options: {
      id: null,
      userObj: null,
      tooltip: {
        position: {
          my: 'right center',
          at: 'left center',
        },
        style: {
          classes: 'ui-tooltip-shadow ui-tooltip-rounded ui-tooltip-light ui-tooltip-forum'
        },
      }
    },

    _changeLanguage: $.noop,

    destroy: function() {
      $.Widget.prototype.destroy.call(this);
      var elementIndex = $.Forum.UserName.instances.indexOf(this);
      if (elementIndex != -1)
        $.Forum.UserName.instances.splice(elementIndex, 1);
    },
  }
  $.widget('Forum.UserName', Forum.widget.userName);
  $.extend($.Forum.UserName, {
    instances: new Array(),
  });
  Forum.socketHandler.subscribe('userChange', function(userObj) {
    Forum.controller.user.set(userObj);
    $.Forum.UserName.instances.forEach(function(element) {
      element._update(userObj.id);
    });
  });
})(jQuery)
