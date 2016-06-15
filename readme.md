## Functional UI architecture with performance challenge

Only child component would need to update, but since it diffs/patches all the components on the way there's a performance hit.

Performance hit can be noticed from devtools JS profiling.


Run

```
npm install
npm run dev
```


```
// index.js (customization)
App.init = () => {
  return {
    items: generateContent(50) // Increase/decrease number of elements if you will
  }
};
```
