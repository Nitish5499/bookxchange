# Development

## Guidelines

### Requires

Follow the order

- external libraries
- controllers
- middlewares
- validations
- models
- others

### Writing Tests

Please use comments for better understanding of tests

### Commit Messages

- Capitalize the first letter of the subject line
- Use the present tense ("Add feature" instead of "Added feature")

### Pull Requests

- Give a short description of what the pull request does
- Capitalize the first letter of the title
- Always **Squash and merge**

## Known Issues

### Pre-commit runs test instead of lint

Check if `.git/hooks/pre-commit` has the following :

```
#!/bin/sh
# husky
# Created by Husky v4.3.0 (https://github.com/typicode/husky#readme)
#   At: 08/11/2020, 15:14:37
#   From: ./bookxchange-server/node_modules/husky (https://github.com/typicode/husky#readme)
. "$(dirname "$0")/husky.sh"
```

### Unable to run server on Windows

1. Install Ubuntu terminal for Windows from [here](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6)

2. Update packages

```
sudo apt-get update
```

3. Go to the directory / drive you want to access

4. Install `nodejs`

```
sudo apt install nodejs
```

4. Install `node dependencies`

```
npm install

sudo npm install basetag
```

5. Start server

```
npm start
```
