var _ = require('lodash');

function Widget(type) {
    if (!(this instanceof Widget)) return new Widget(type);

    this.type = type;

    _.bindAll(this);
}

// Move cursor inside the widget
Widget.prototype.enter = function(i) {

};

// Replace widget text
Widget.prototype.replace = function(text) {

}

module.exports = Widget;
