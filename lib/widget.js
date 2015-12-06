var _ = require('lodash');

function Widget(type, originalRange, props) {
    _.bindAll(this);

    this.originalRange = originalRange;
    this.type = type;
    this.ctx = this.type.opts;
    this.props = props;

    this.doc = this.type.doc();
    this.editor = this.doc.getEditor();

    // Create DOM element
    this.el = this.type.createElement(this);
    this.el.className = this.el.className + ' cm-widget';

    // Create codemirror marker
    this.marker = this.doc.markText(this.originalRange.from, this.originalRange.to, {
        replacedWith: this.el,
        clearOnEnter: true,
        atomic: true
    });
}

// Return exact range of widget
Widget.prototype.find = function() {
    return (this.marker? this.marker.find() : this.originalRange);
};

// Signal to codemirror that the size of the widget has changed
Widget.prototype.update = function() {
    if (this.marker) this.marker.changed();
};

// Move cursor inside the widget
Widget.prototype.enter = function(pos) {
    pos = _.defaults(pos || {}, {
        line: 0,
        ch: 1
    });
    var markerPos = this.find();

    this.doc.setCursor({
        ch: pos.line == 0? (markerPos.from.ch + pos.ch) : pos.ch,
        line: markerPos.from.line + pos.line
    });
    this.editor.focus();
};

// Replace widget text
Widget.prototype.replace = function(text) {
    var range = this.find();
    this.doc.replaceRange(text, range.from, range.to);
};

module.exports = Widget;
