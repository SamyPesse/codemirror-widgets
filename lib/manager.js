var _ = require('lodash');
var CodeMirror = require
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
}

// Return doc for this manager
Manager.prototype.doc = function() {
    return this.editor.getDoc()
};

// Render unrendered marker
Manager.prototype.renderUnrendered = function() {
    var that = this;

    if (!this.unrendered) return;

    this.editor.off('cursorActivity', this.onCursorActivity);

    var range = this.unrendered.find();
    if (!range) return;

    var props = this.unrendered.xProps;
    var type = this.unrendered.xType;

    this.unrendered.clear();
    this.unrendered = null;
    this.get(type).createWidget(range, props);

    that.editor.constructor.signal(that.editor, 'renderUnrendered');
};


// Set the marker that is not rendered
Manager.prototype.setUnrendered = function(_unrendered) {
    var that = this;

    this.renderUnrendered();
    this.unrendered = _unrendered;
    this.unrendered.unrendered = true;

    this.editor.on('cursorActivity', this.onCursorActivity);

    that.editor.constructor.signal(that.editor, 'unrender');
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
    return _.find(this.bindings, {
        id: id
    });
};

// Cursor position changed
// Render the marker if cursor is outside its range
Manager.prototype.onCursorActivity = function() {
    if (!this.unrendered) return;

    var doc = this.doc();
    var cursor = doc.getCursor();
    var range = this.unrendered.find();
    if (!range) return;

    if (utils.posOutsideRange(cursor, range)) {
        this.renderUnrendered();
    }
};

module.exports = Manager;
