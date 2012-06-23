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
        select: function() {
          if (Forum.settings.userSettings.useBackgrounds)
            setTimeout(function() {
              Forum.widgetInstances.backgroundChanger.resize();
            }, 0);
        },
      });
      this._loadGui();
      $.Widget.prototype._create.call(this);
    },

    _init: function() {
    },

    launchTab: function(tabListObjName, options) {
      var self = this;
      $.when(
        Forum.codeLoader.load('Forum.widget.' + options['widgetName'])
      ).then(function() {
        if (!options.options)
          options.options = new Object();
        var widgetOptions = options.options;
        var widgetName = options['widgetName'];
        if (!self.tabListObj[tabListObjName]) {
          // The tab does not exist yet, create it
          var closable = true;
          if (options.closable === false)
            closable = false;
          if (closable) {
            self.tabHolder.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a> <span class="ui-icon ui-icon-close" data-text="Close tab">' + _('Close tab') + '</span></li>');
          } else {
            self.tabHolder.tabs('option', 'tabTemplate', '<li><a href="#{href}" data-text="#{label}"></a></li>');
          }
          self.tabHolder.tabs('add', '#' + tabListObjName);
          var tabLabel = self.tabHolder.find('ul > li > a[href="#' + tabListObjName + '"]');
          if (closable) {
            tabLabel.siblings("span.ui-icon-close").bind( "click", function() {
              // Cut the beginnig # from the tab id
              var widgetId = tabLabel.attr('href').substr(1);
              self.tabListObj[widgetId].destroy();
              self.tabHolder.tabs('remove', widgetId);
            });
          }
          var tabContent = self.tabHolder.find('> div#' + tabListObjName + ':first');
          widgetOptions.tabLabel = tabLabel;
          //        tabContent.TopicList({tabLabel:tabLabel}).data('TopicList');
          // Change case of the first letter, because the widget name in jQuery starts with upper case
          widgetName = widgetName[0].toUpperCase() + widgetName.substr(1);
          self.tabListObj[tabListObjName] = eval('tabContent.' + widgetName + '(widgetOptions).data(\'' + widgetName + '\')');
          self.tabHolder.tabs('select', tabListObjName);
          // Open the tab, execute the widget on its content name
        } else {
          // The tab exists, send an update to the existing tab, and select it too
          self.tabListObj[tabListObjName].update(widgetOptions);
          self.tabHolder.tabs('select', tabListObjName);
        }
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
          url: '/api/session/getGuiState',
          dataType: 'json',
        })
      ).then(function(guiStateObj){
        for (var tabListObjName in guiStateObj['tabList']) {
          self.launchTab(tabListObjName, guiStateObj['tabList'][tabListObjName])
        }
      });
    },

  };

  $.widget('Forum.ForumTabs', Forum.widget.forumTabs);
})(jQuery);
