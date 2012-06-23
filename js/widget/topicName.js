(function($) {
  Forum.widget.topicName = {
    _create: function() {
      var self = this;
      this.element.html('<img src="/skins/' + Forum.settings.usedSkin + '/images/ajax-loader-small.gif" alt="' + _('Loading, please wait ...') +  '" title="' + _('Loading, please wait ...') +  '"/>');
      if (this.options.id == null && this.options.topicObj == null)
        this.element.html('<img src="/skins/' + Forum.settings.usedSkin + '/images/icon-error.png" alt="' + _('Failure at initialization!') +  '" title="' + _('Failure at initialization!') +  '"/>');
      else {
        if (this.options.topicObj == null) {
          $.when(
            Forum.controller.topic.get([this.options.id])
          ).then(function(topicObjArray) {
            self.options.topicObj = topicObjArray[self.options.id];
            self._update();
          });
        } else {
          this.options.id = this.options.topicObj.id;
          self._update();
        }
      }
      $.Forum.TopicName.instances.push(this);
      //console.log('creating ' + $.Forum.TopicName.instances.length);
      $.Widget.prototype._create(this);
    },

    _update: function() {
      var self = this;
      // The comment time takes a DateTime widget, and the ownerId/currCommentOwnerId a user widget, any other stuff displays the same way
      if (this.options.display != 'currCommentTime' && this.options.display != 'ownerId' && this.options.display != 'currCommentOwnerId') {
        this.element.html(this.options.topicObj[this.options.display]);
        if (this.options.tooltip != null) {
          this.options.tooltip.content = {
            text: this.options.topicObj[this.options.tooltip.content],
          };
          this.element.qtip(this.options.tooltip);
        }
        if (this.options.click == 'openTopic') {
          this.element.click(function() {
            var topicId = self.options.id;
            Forum.widgetInstances.tabsWidget.launchTab('topicComments_' + topicId, {
              widgetName: 'topicComments',
              closable: true,
              options: {
                showNewest: true,
                topicObj: self.options.topicObj,
              },
            });
          });
        }
      } else {
        if (this.options.display == 'currCommentTime') {
          this.element.DateTime({
            time: this.options.topicObj.currCommentTime,
          });
        }
        if (this.options.display == 'currCommentOwnerId') {
          this.element.UserName({
            id: this.options.topicObj.currCommentOwnerId
          });
        }
      }
    },

    options: {
      id: null,
      // The topic object can be directly given, so the widget wont launch a load request when the topic object is not fully loaded
      topicObj: null,
      click: null,
      display: 'htmlName',
      /**
       * Except for the content, all other object variables are passed to the qTip2 initialization. So, for example:
       *
       * tooltip: {
       *   content: 'htmlName',
       *   position: {
       *     my: 'left center',
       *     at: 'right center',
       *   },
       *   style: {
       *     classes: 'ui-tooltip-shadow ui-tooltip-rounded ui-tooltip-light ui-tooltip-forum',
       *   },
       * }
       */
      tooltip: null,
    },

    destroy: function() {
      var elementIndex = $.Forum.TopicName.instances.indexOf(this);
      //console.log('destroying ' + $.Forum.TopicName.instances.length);
      if (elementIndex != -1)
        $.Forum.TopicName.instances.splice(elementIndex, 1);
      $.Widget.prototype.destroy.call(this);
    },

    _changeLanguage: $.noop,
  };
  $.widget('Forum.TopicName', Forum.widget.topicName);
  $.extend($.Forum.TopicName, {
    instances: new Array(),
  });
})(jQuery)
