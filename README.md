# codemirror-widgets

Utility to easily write interactive widgets for CodeMirror.

### Installation

```
$ npm install codemirror-widgets
```

### Usage

Example, replace LaTeX math (`$$ ... $$`) by a preview using [KaTeX](https://github.com/Khan/KaTeX)

```js
var widgets = require('codemirror-widgets');
var katex = require('katex');

// Create a type of widget
var WidgetMath = widgets.createType({
    mixins: [
        widgets.mixins.re(/\$\$([^$]+)\$\$/g, function(match) {
            return {
                props: {
                    text: match[1]
                }
            };
        }),
        widgets.mixins.editDelimit('$$', '$$')
    ],

    createElement: function(widget) {
        // Create the spam to replace the formula
        var span = document.createElement('span');

        // Render the formula using katex
        katex.render(widget.props.text, span)

        return span;
    }
});


// Create a widgets manager connected to an editor
var manager = widgets.createManager(editor);

// Connect a type of widget to the manager
manager.enable(WidgetLink);
```

### Mixins

Some prebuilt mixins make it event easier to create awesome widgets:

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

Bind a menu with multiple actions to your widgets. The menu will show up on click (like on Gmail).

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


##### `editParagraph`

Helper to update a paragraph when user is typing

```js
var widgetLink = widgets.createType({
    mixins: [
        widgets.mixins.editParagraph()
    ],

    ...
});
```
