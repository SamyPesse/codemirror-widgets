var _ = require('lodash');

var utils = require('./utils');

function Manager(editor) {
    if (!(this instanceof Manager)) return new Manager(editor);
    _.bindAll(this);

    this.id = _.uniqueId('widgetsManager');

    // Prepare codemirror instance
    this.editor = editor;
    this.editor._widgets = this;

    this.unrendered = null;

    // Widgets bindings
    this.bindings = {};

    // Bind editor
    this.editor.on('cursorActivity', this.onCursorActivity);
}

// Return doc for this manager
Manager.prototype.doc = function() {
    return this.editor.getDoc()
};

// Render as text a marker
Manager.prototype.unrenderRange = function(range, type, props) {
    this.renderUnrendered();

    this.unrendered = this.doc().markText(range.from, range.to);
    this.unrendered.xProps = props;
    this.unrendered.xType = type.id;
};

// Render unrendered marker
Manager.prototype.renderUnrendered = function() {
    if (!this.unrendered) return;

    var range = this.unrendered.find();
    if (!range) return;

    var props = this.unrendered.xProps;
    var type = this.unrendered.xType;

    this.unrendered.clear();
    this.unrendered = null;
    this.get(type).createWidget(range.from, range.to, props);
};

// Check if manager has an unrendered marker of a certain type
Manager.prototype.hasUnrendered = function(type) {
    return (unrendered && unrendered.xType == (type.id || type));
}

// Add/Enable a widget type
Manager.prototype.enable = function(Type, opts) {
    this.disable(Type);

    this.bindings[Type.id] = new Type(this, opts);
    this.bindings[Type.id].enable();
};

// Disable and clear a widget type
Manager.prototype.disable = function(Type) {
    if (!this.bindings[Type.id]) return;

    this.bindings[Type.id].disable();
    delete this.bindings[Type.id];
};

// Return a specific type
Manager.prototype.get = function(id) {
    return this.bindings[id];
};

// Cursor position changed
// Render the marker if cursor is outside its range
Manager.prototype.onCursorActivity = function() {
    if (!this.unrendered) return;

    var cursor = doc.getCursor();
    var range = this.unrendered.find();
    if (!range) return;

    if (utils.posOutsideRange(cursor, range)) {
        this.renderUnrendered();
    }
};

module.exports = Manager;
