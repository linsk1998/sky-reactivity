# sky-reactivity

a reactivity system to automatically update the view when the state changes.

```javascript
import { signal } from "sky-reactivity";
var box = signal(1);
box.get();
box.set(2);
```

```javascript
import { signal, computed } from "sky-reactivity";
var box = signal(1);
var com = computed(() => box.get() * 2);
computed.get()
```

```javascript
import { signal, batch } from "sky-reactivity";
var box = signal(1);
batch(() => {
	box.set(2);
	box.set(3);
});
```