# Observablehq Web Component

Another web experiment creating ways to publish and layouting [Observablehq notebooks](https://observablehq.com/) content.

A web component might make sense as it creates a private scope for styles, so you can import multiple cells from different notebooks.

## Usage

Add the script tag to your html page

```html
<script src="https://cdn.jsdelivr.net/npm/observablehq-web-component" defer></script>
```
create an `<o-cell>` element

```html
<o-cell class="flex-child" notebook="@d3/bar-chart" cell="chart" injections={"height":400,"color":"darkgray"}></o-cell>
```

## `<o-cell>`

I've name the component as `<o-cell>` Observablehq cell,trying to be short and make some sense, however I'm still not sure if this is a good name.

This is a very simple implementation:
* you can inject and redefine attributes from your original notebook
* you can select different cells
* mount the entire notebook
* `width` is set from the parent wrapper, making it fully responsive to the parent layout

### Attributes

#### `notebook`: required
notebook handle, normally user/notebook or d/hash for shared/private notebooks
#### `cell`: optional
cell name you're mounting
#### `injections`: optional
a JSON like string with cell values you want to override example: `{"height":300,"color":"brown"}`, ps it's a bit annoying a JSON string as an html attribute, however, this is the easiest way to make it simple as possible

## Example

```html
<!-- multiple injections  -->

<o-cell class="flex-child" notebook="@d3/bar-chart" cell="chart" injections={"height":300,"color":"brown"}></o-cell>
<o-cell class="flex-child" notebook="@d3/bar-chart" cell="chart" injections={"height":400,"color":"red"}></o-cell>
<o-cell class="flex-child" notebook="@d3/bar-chart" cell="chart" injections={"color":"gray"}></o-cell>

<!-- viewof cell example  -->
<o-cell notebook="@observablehq/introduction-to-views" cell="viewof point"></o-cell>
<!-- entire notebook example -->
<o-cell notebook="@fil/synchronized-projections"></o-cell>
```

## Problems / TODOs
* If you embed two cells from the same notebook, they won't be reactive/communicate.


### Other simliar projects
* https://github.com/zzzev/observable-press
* https://github.com/radames/observablehq-viewer

#### Aknowlegements   
I was inspired by [Dataflow Bostock notebook](https://observablehq.com/@mbostock/dataflow)
