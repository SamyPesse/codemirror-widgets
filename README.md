# codemirror-widgets

Utility to easily write interactive widgets for CodeMirror.

### Installation

```
$ npm install codemirror-widgets
```

### Usage

```js
var widgets = require('codemirror-widgets');

// Create a type of widget
var WidgetLink = widgets.createType({

});


// Create a widgets manager connected to an editor
var manager = widgets.createManager(editor);

// Connect a type of widget to the manager
manager.enable(WidgetLink);
```

### Mixins

Some prebuilt mixins make it event easier to create widgets:

##### `re`

Find occurrence using a Regex:

```js
var widgetMath = widgets.createType({
    mixins: [
        widgets.mixins.re(/\$\$([^$]+)\$\$/g, function(match) {
            return {
                props: {
                    text: match[1]
                }
            };
        })
    ],

    ...
});
```

##### `menu`

Bind a menu with multiple actions to your widgets:

```js
var widgetLink = widgets.createType({
    mixins: [
        widgets.mixins.menu({
            entries: [
                {
                    label: 'Open',
                    click: function(widget) {
                        window.open(widget.props.href, '_blank')
                    }
                }
            ]
        })
    ],

    ...
});
```
