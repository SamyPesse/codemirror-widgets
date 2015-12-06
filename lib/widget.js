var _ = require('lodash');

function Widget(binding) {
    if (!(this instanceof Widget)) return new Widget(binding);

    _.bindAll(this);
}


module.exports = Widget;
