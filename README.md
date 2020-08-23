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
<o-notebook class="flex-child" url="@d3/bar-chart" cell="chart" injections={"height":400,"color":"darkgray"}></o-cell>
```

## `<o-notebook>`

I've name the component as `<o-notebook>` as for Observablehq notebook and `<o-cell>` for Observablehq cells. 

This is a very simple implementation:
* you can inject and redefine attributes from your original notebook
* you can select different cells
* mount the entire notebook
* `width` is set from the parent wrapper, making it fully responsive to the parent layout, although, there are few problems related to this
* you can nest under`<o-notebook>` multiple `<o-cell>` in case you want to layout multiple cells from the same notebook.

### Attributes

#### `url`: required
notebook handle, normally user/notebook or d/hash for shared/private notebooks
#### `cell`: optional
if you're mounting a single notebook cell, juste name it as `<o-notebook cell="NAME">`, if you have multiples, read below about `<o-cell`>
#### `injections`: optional
a JSON like string with cell values you want to override example: `{"height":300,"color":"brown"}`, ps it's a bit annoying a JSON string as an html attribute, however, this is the easiest way to make it simple as possible

## `<o-cell>`

You can nest cells from the same notebook under `<o-notebook>`
```html
<o-notebook url="d/aaa64eeb1e6ec93f">
    <div class="flex">
        <o-cell name="viewof dateView" class="flex-child"></o-cell>
        <o-cell name="viewof weight" class="flex-child"></o-cell>
    </div>
</o-notebook>
```
### Attributes

notebook handle, normally user/notebook or d/hash for shared/private notebooks
#### `name`: require
cell name your mounting

## Example 1



- Original Notebooks
    - [@observablehq/introduction-to-views](https://observablehq.com/@observablehq/introduction-to-views)
    - [@fil/synchronized-projections](https://observablehq.com/@fil/synchronized-projections)
- [link](https://radames.github.io/observablehq-web-component/test/test.html)
- [source](https://github.com/radames/observablehq-web-component/blob/main/test/test.html)

```html
<!-- multiple injections  -->
    <div class="flex">
        <o-notebook class="flex-child" url="@d3/bar-chart" cell="chart" injections={"height":300,"color":"brown"}>
        </o-notebook>
        <o-notebook class="flex-child" url="@d3/bar-chart" cell="chart" injections={"height":400,"color":"red"}>
        </o-notebook>
        <o-notebook class="flex-child" url="@d3/bar-chart" cell="chart" injections={"color":"gray"}></o-notebook>
    </div>
    <!-- viewof cell example  -->
    <o-notebook url="@observablehq/introduction-to-views" cell="viewof point"></o-notebook>
    <!-- whole notebook example -->
    <o-notebook url="@fil/synchronized-projections"></o-notebook>

    <o-notebook class="flex-child" url="@d3/bar-chart" cell="chart" injections={"height":400,"color":"darkgray"}></o-cell>
```

## Example 2 Dashboard

- Original Notebook [@pierreleripoll/vegasync](https://observablehq.com/@pierreleripoll/vegasync)
- [link](https://radames.github.io/observablehq-web-component/test/dashboard.html)
- [source](https://github.com/radames/observablehq-web-component/blob/main/test/dashboard.html)

```html
<!-- single notebook multiple cells -->
    <o-notebook url="d/aaa64eeb1e6ec93f">
        <div class="flex">
            <o-cell name="viewof dateView" class="flex-child"></o-cell>
            <o-cell name="viewof weight" class="flex-child"></o-cell>
            <o-cell name="viewof sport" class="flex-child"></o-cell>
            <o-cell name="viewof sankeyView" class="flex-child"></o-cell>
            <o-cell name="viewof medalsPieView" class="flex-child"></o-cell>
            <o-cell name="viewof nationality" class="flex-child"></o-cell>
        </div>
    </o-notebook>
```


inception example
https://observablehq.com/d/dec1870d937612eb

## Problems / TODOs
* If you embed two cells from the same notebook, they won't be reactive/communicate.


### Other simliar projects
* https://github.com/zzzev/observable-press
* https://github.com/radames/observablehq-viewer

#### Aknowlegements   
I was inspired by [Dataflow Bostock notebook](https://observablehq.com/@mbostock/dataflow)
