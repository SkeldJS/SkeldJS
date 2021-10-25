## @skeldjs/text

This package contains a text building API for the [Rich Text formatter used in Among Us](http://digitalnativestudios.com/textmeshpro/docs/rich-text), meant to be installed separately with `npm install --save @skeldjs/text` or `yarn add @skeldjs/text`, and is one package of a bigger project, [skeldjs](https://github.com/skeldjs/SkeldJS).

You can view auto-updating documentation for this package hosted at github pages at https://skeld.js.org/modules/text.html

## Basic Usage

### Creating a basic document
```ts
const formatted = tb()
    .bold(
        color("red", "Hello")
    );

console.log(formatted.toString()); // <b><color="red">Hello</color></b>
```
or you can define a boilerplate for the document, where the children of the elements in the `tb` function are not considered.
```ts
const formatted = tb(bold(), color("red"))
    .text("Hello");

console.log(formatted.toString()); // <b><color="red">Hello</color></b>
```

You can also create elements standalone.
```ts
const formatted = bold("Hello");

console.log(formatted.toString()); // <b>Hello</b>
```

### Parse RichText
The package also provides a way to parse the Rich Text format.
```ts
const parsed = parseTMP("<b><color=red>Hello</color></b>");

console.log(parsed);
/*
TMPElement {
  tagName: 'doc',
  attributes: {},
  children: [
    TMPElement {
      tagName: 'b',
      attributes: {},
      children: [
        TMPElement {
          tagName: 'color',
          attributes: { color: 'red' },
          children: [ 'Hello' ]
        }
      ]
    }
  ]
}
*/
```

### Generate HTML
It also provides a way to convert roughly to HTML where possible.
```ts
const parsed = parseTMP("<b><color=red>Hello</color></b>");

console.log(toHTML(parsed));
/*
<div style="width:100%;height:100%;">
    <b>
        <div style="display:inline-block;color:red">
            <span>Hello</span>
        </div>
    </b>
</div>
*/
```
