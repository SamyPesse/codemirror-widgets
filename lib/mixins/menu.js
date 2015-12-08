var _ = require('lodash');
var utils = require('../utils');



module.exports = function(opts) {
    opts = _.defaults(opts || {}, {
        classOpen: 'widget-menu-open',

        entries: [
            {
                label: 'Edit',
                click: function(w) {
                    w.enter();
                }
            }
        ],
        position: function(widget) {
            var range = widget.find();
            var pos = widget.editor.charCoords(range.from, 'local');

            return {
                left: pos.left,
                top: (pos.top + widget.el.offsetHeight)
            };
        }
    });

    return {

        enable: function() {
            this.closeMenu();



            //this.debounceCloseMenu = _.debounce(this.closeMenu, 100);
            //this.manager.editor.on('cursorActivity', this.debounceCloseMenu);
        },
        disable: function() {
            this.closeMenu();
            //this.manager.editor.off('cursorActivity', this.debounceCloseMenu);
        },

        // On document click
        onMenuDocClick: function() {
            this.closeMenu();
        },

        // Close opened menu
        closeMenu: function(force) {
            if (!this.manager.menu || (force !== true && this.manager.ignoreCloseMenu)) return;


            this.editor.off('cursorActivity', this.onMenuDocClick);
            document.body.removeEventListener('click', this.onMenuDocClick, false);

            var el = this.manager.menu.el;
            var widget = this.manager.menu.widget;

            el.parentNode.removeChild(el);

            utils.domRemoveClass(widget.el, opts.classOpen);

            this.manager.menu = null;
        },

        // Open menu for a widget
        // Open new menu
        openMenu: function(widget, direction) {
            var that = this;
            var editor = this.manager.editor;

            this.closeMenu(true);

            // Prevent closing the menu in the loop
            this.manager.ignoreCloseMenu = true;

            if (direction == 'before') widget.moveBefore();
            else if (direction == 'after') widget.moveAfter();

            setTimeout(function() {
                that.manager.ignoreCloseMenu = false;
                that.editor.on('cursorActivity', that.onMenuDocClick);
                document.body.addEventListener('click', that.onMenuDocClick, false);
            }, 1);

            // Calcul position for menu
            var pos = opts.position(widget);

            // Create new menu
            var el = document.createElement('div');
            el.className = 'cm-widget-menu menu-'+this.className;

            // Add entries
            _.each(widget.menuEntries, function(menuEntry) {
                var a = document.createElement('a');
                a.innerText = menuEntry.label;
                a.className = menuEntry.selected? 'selected' : '';
                a.href = '#';
                a.onclick = function(e) {
                    e.preventDefault();

                    that.closeMenu();
                    menuEntry.click(widget);
                };
                el.appendChild(a);
            });

            // Mesure its size
            el.style.display = 'block';
            el.style.visibility = 'hidden';
            el.style.position = 'initial';
            el.style.float = 'left';

            // Add menu to sizer
            var scrollArea = editor
                .getWrapperElement()
                .getElementsByClassName('CodeMirror-sizer')[0];
            scrollArea.appendChild(el);

            var menuWidth = el.offsetWidth;
            var containerWidth = scrollArea.offsetWidth;
            if (pos.left > (containerWidth - menuWidth)) {
                pos.right = 0;
                pos.left = undefined;
            }

            el.style.display = 'block';
            el.style.visibility = 'initial';
            el.style.position = 'absolute';
            if (!_.isUndefined(pos.left)) el.style.left = pos.left+'px';
            if (!_.isUndefined(pos.right)) el.style.right = pos.right+'px';
            if (!_.isUndefined(pos.top)) el.style.top = pos.top+'px';

            // Mark element as selected
            this.manager.menu = {
                el: el,
                widget: widget
            };
            utils.domAddClass(widget.el, opts.classOpen);
        },

        // Setup menu for a specific widget
        prepareWidget: function(widget) {
            var that = this;

            widget.menuEntries = _.isFunction(opts.entries)? opts.entries(widget) : opts.entries;

            // Show menu
            widget.el.addEventListener('click', function(e) {
                e.preventDefault();
                if (widget.menuEntries.length == 1) {
                    widget.menuEntries[0].click(widget);
                } else {
                    that.openMenu(widget, 'before');
                }
            });

            // Trigger first action on double click
            widget.el.addEventListener('dblclick', function(e) {
                e.preventDefault();
                widget.menuEntries[0].click(widget);
            });

            // Close menu when marker is cleared
            widget.marker.on('clear', function() {
                that.closeMenu();
            });
        }

    };
};