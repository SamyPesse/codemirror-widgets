var _ = require('lodash');

var Context = require('./context');

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
Manager.prototype.enable = function(type, ctx) {
    this.disable(type);

    this.bindings[type.id] = new Binding(this, type, ctx);
    this.bindings[type.id].enable();
};
Manager.prototype.disable = function(type) {
    if (!this.bindings[type.id]) return;

    this.bindings[type.id].disable();
    delete this.bindings[type.id];
};



module.exports = Manager;
