# checkshape

```js
const Shape = require('checkshape');
const s = new Shape({
  user_id: (userId) => userExists(userId),
  name: (name, {user_id}) => findUserByName(name).then((user) => user.id === user_id)
})

s.check(data).then(({result, errors}) => {})
```
