# cycle-dev-poc

> npm i -g cycle-dev-poc

> cycle-dev-poc app.js

app.js example
```
import {makeDOMDriver, div} from '@cycle/dom';

import {Observable as O} from 'rx';

const drivers = {
  DOM: makeDOMDriver('.app')
  };

function main ({DOM}) {
  return {
    DOM: O.interval(1000).map(i =>
      div('.hello-world', 'Hello world !')
    )
  };
}

export {main, drivers};
```
