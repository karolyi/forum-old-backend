(function($) {
  Forum.widget.forumTabs = {
    options: {
    },

    _create: function() {
      var self = this;
      this.tabListObj = {};
      Forum.widgetInstances.tabsWidget = this;
      this.element.tabs().find(".ui-tabs-nav").sortable({
        axis: "x",
        stop: function() {
          self.element.tabs( "refresh" );
        }
      });
      this.element.tabs({
        show: function() {
          if (Forum.settings.userSettings.useBackgrounds)
            Forum.widgetInstances.backgroundChanger.resize();
        },
      });
      this.tabLabels = this.element.find('ul#tab-label-list');
      this._loadGui();
      $.Widget.prototype._create.call(this);
    },

    _init: function() {
    },

    _parseTabUri: function (tabUri) {
      var tabUriArray = tabUri.split('/');
      // Remove the first '' string
      tabUriArray.shift();
      var widgetNameObj = {
        fileName: 'noop',
        widgetName: 'noop',
        closable: false,
        id: '',
        uri: tabUri,
      };
      switch(tabUriArray[0]) {
        case 'index':
          widgetNameObj.fileName = 'topicList';
          widgetNameObj.widgetName = 'TopicList';
          widgetNameObj.closable = false;
          widgetNameObj.id = '/index';
          break;
      }
//      widgetNameObj.id = widgetNameObj.id.replace('/', '_');
      return widgetNameObj;
    },

    launchTab: function(tabUri) {
      var self = this;
      var widgetNameObj = this._parseTabUri(tabUri);
      $.when(
        Forum.codeLoader.load('Forum.widget.' + widgetNameObj.fileName)
      ).then(function() {
        if (!self.tabListObj[widgetNameObj.id]) {
          self._addTab(widgetNameObj);
        } else {
          // The tab exists, send an update to the existing tab, and select it too
          self.tabListObj[widgetNameObj.id].update(tabUri);
          self.element.tabs('select', '#' + widgetNameObj.id);
        }
        $('html, body').animate({scrollTop:0}, 'slow');
      })
    },

    _addTab: function (widgetNameObj) {
      var self = this;
      // The tab does not exist yet, create it
      this._setNewClosable(widgetNameObj.closable);

      var liElement = $(this.tabTemplate.replace(/#\{href\}/g, "#" + widgetNameObj.id).replace(/#\{label\}/g, '::'));
      liElement.data('tab-uri', widgetNameObj.uri);
      this.tabLabels.append(liElement);
      var aElement = liElement.find('a');
      var contentElement = $('<div/>', {
        id: widgetNameObj.id,
      });
      this.element.append(contentElement);
      this.element.tabs('refresh');

      if (widgetNameObj.closable) {
        liElement.find('span.ui-icon-close').bind( "click", function(event) {
          contentElement.remove();
          liElement.remove();
          delete(self.tabListObj[widgetNameObj.id]);
        });
      }
      var widgetOptions = {
        tabElement: liElement,
      };
      self.tabListObj[widgetNameObj.id] = contentElement[widgetNameObj.widgetName](widgetOptions).data(widgetNameObj.widgetName);
      self.element.tabs('select', '#' + widgetNameObj.id);
    },

    _setNewClosable: function (closable) {
      if (closable)
        this.tabTemplate = '<li><a href="#{href}" data-text="#{label}">#{label}</a><span class="ui-icon ui-icon-close" data-text="Close tab">' + _('Close tab') + '</span></li>';
      else
        this.tabTemplate = '<li><a href="#{href}" data-text="#{label}">#{label}</a></li>';
    },

    destroy: function() {
      delete(Forum.widgetInstances.tabsWidget);
      $.Widget.prototype.destroy.call(this);
    },

    _changeLanguage: function() {
      for (var tabName in this.tabListObj)
        this.tabListObj[tabName]._changeLanguage();
    },

    _loadGui: function() {
      var self = this;
      $.when(
        $.ajax({
          url: Forum.settings.apiHost + '/session/getGuiState',
          dataType: 'json',
        })
      ).then(function(guiStateObj){
        for (var tabId in guiStateObj.tabList) {
          self.launchTab(guiStateObj.tabList[tabId])
        }
      });
    },

  };

  $.widget('Forum.ForumTabs', Forum.widget.forumTabs);
})(jQuery);
