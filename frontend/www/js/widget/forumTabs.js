(function($) {
  Forum.widget.forumTabs = {
    tabListObj: new Object(),

    _create: function() {
      this.self = this;
      Forum.widgetInstances.tabsWidget = this;
      this.root = $(this.element.find('> div#contentHolder'))
      this.tabHolder = this.root.find('> div#mainTab');
      this.tabHolder.tabs().find(".ui-tabs-nav").sortable({ axis: "x" });
      this.tabHolder.tabs({
        show: function() {
          if (Forum.settings.userSettings.useBackgrounds)
            Forum.widgetInstances.backgroundChanger.resize();
        },
      });
      this._loadGui();
      $.Widget.prototype._create.call(this);
    },

    _init: function() {
    },

    launchTab: function(tabId, options) {
      var self = this;
      $.when(
        Forum.codeLoader.load('Forum.widget.' + options['widgetName'])
      ).then(function() {
        if (!options.options)
          options.options = new Object();
        var widgetOptions = options.options;
        var widgetName = options['widgetName'];
        if (!self.tabListObj[tabId]) {
          // The tab does not exist yet, create it
          var closable = true;
          if (options.closable === false)
            closable = false;
          if (closable) {
            self.tabHolder.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a> <span class="ui-icon ui-icon-close" data-text="Close tab">' + _('Close tab') + '</span></li>');
          } else {
            self.tabHolder.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a></li>');
          }
          self.tabHolder.tabs('add', '#' + tabId);
          var tabLabel = self.tabHolder.find('ul > li > a[href="#' + tabId + '"]');
          if (closable) {
            tabLabel.siblings("span.ui-icon-close").bind( "click", function() {
              // Cut the beginnig # from the tab id
              // var tabId = tabLabel.attr('href').substr(1);
              self.tabListObj[tabId].destroy();
              self.tabHolder.tabs('remove', tabId);
              delete(self.tabListObj[tabId]);
            });
          }
          var tabContent = self.tabHolder.find('> div#' + tabId + ':first');
          widgetOptions.tabLabel = tabLabel;
          //        tabContent.TopicList({tabLabel:tabLabel}).data('TopicList');
          // Change case of the first letter, because the widget name in jQuery starts with upper case
          widgetName = widgetName[0].toUpperCase() + widgetName.substr(1);
          self.tabListObj[tabId] = eval('tabContent.' + widgetName + '(widgetOptions).data(\'' + widgetName + '\')');
          self.tabHolder.tabs('select', tabId);
          // Open the tab, execute the widget on its content name
        } else {
          // The tab exists, send an update to the existing tab, and select it too
          self.tabListObj[tabId].update(widgetOptions);
          self.tabHolder.tabs('select', tabId);
        }
        $('html, body').animate({scrollTop:0}, 'slow');
      })
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
        for (var tabId in guiStateObj['tabList']) {
          self.launchTab(tabId, guiStateObj['tabList'][tabId])
        }
      });
    },

  };

  $.widget('Forum.ForumTabs', Forum.widget.forumTabs);
})(jQuery);
