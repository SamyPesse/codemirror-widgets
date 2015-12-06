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

        // Close opened menu
        closeMenu: function() {
            if (!this.manager.menu) return;

            var el = this.manager.menu.el;
            var widget = this.manager.menu.widget;

            el.parentNode.removeChild(el);

            utils.domRemoveClass(widget.el, opts.classOpen);

            this.manager.menu = null;
        },

        // Prepare a widget
        prepareWidget: function(widget) {
            widget.menuEntries = _.isFunction(opts.entries)? opts.menu(widget) : opts.entries;

            // Show menu
            widget.el.addEventListener('click', function(e) {
                e.preventDefault();
                if (widget.menuEntries.length == 1) {
                    widget.menuEntries[0].click(widget);
                } else {
                    //openMenu(el, widget);
                }
            });

            // Trigger first action on double click
            widget.el.addEventListener('dblclick', function(e) {
                e.preventDefault();
                widget.menuEntries[0].click(widget);
            });
        }


    };
};