var _ = require('lodash');

function Manager(editor, opts) {
    if (!(this instanceof Manager)) return new Manager(editor, opts);

    this.id = _.uniqueId('widgetsManager');

    // Prepare codemirror instance
    this.editor = editor;
    this.editor._widgets = this;

    this.opts = _.defaults(opts || {}, {

    });

    // Widgets bindings
    this.bindings = {};

    _.bindAll(this);
}


// Add/Remove a type
Manager.prototype.enable = function(Type, opts) {
    this.disable(Type);

    this.bindings[Type.id] = new Type(this, opts);
    this.bindings[Type.id].enable();
};
Manager.prototype.disable = function(Type) {
    if (!this.bindings[type.id]) return;

    this.bindings[type.id].disable();
    delete this.bindings[type.id];
};


module.exports = Manager;
