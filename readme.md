# checkshape

```js
const shape = require('checkshape');
const s = shape({
  user_id: (userId) => userExists(userId),
  name: (name, {user_id}) => findUserByName(name).then((user) => user.id === user_id)
})

s.check(data).then(({result, errors}) => {})
```
