# editor

* A simple lightweight Javascript rich-text editor.
* No dependencies, no plug-ins needed.
* version : 0.9.1 beta



## Installing

#### Step 1 : Simply link required files.

```html
<link rel="stylesheet" href="gbcEditor.css">
```

```html
<script src="gbcEditor.js"></script>
```



#### Step 2 : Create HTML markup

```html
<div id="editor"></div>
```



#### Step 3 : Call the editor

```javascript
const editor = new gbcEditor.init({
    element: 'editor'  //editor ID
});
```



## Demo

* [View demo](http://sungkyu.me/editor/)



## Resources

* [Release Notes 0.9.1](https://github.com/soulmotion21/editor/releases/tag/v0.9.1)



## Develop

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```



## License

Released under the MIT license - http://opensource.org/licenses/MIT
