[![Actions Status](https://github.com/shreyas-sriram/bookxchange-server/workflows/CI/CD/badge.svg)](https://github.com/shreyas-sriram/bookxchange-server/actions)

# bookxchange-server

The server-side API for the BookXchange Application.

## Commands

> All executable npm commands are under `scripts` in `package.json`, please look there for more.

To run any script, do

```
npm run <script-name>
```

Run server

```
npm start
```

> To run server on Windows environment, see [here](#unable-to-run-server-on-windows).

Test

```
npm run test
```

Test specific file

```
npm run test [ < path/to/file > ]
```

Lint - manual run

```
npm run lint:fix
```

## Swagger API Documentation

[BookXchange-SwaggerHub](https://app.swaggerhub.com/apis/BookXchange/BookXchange-Backend-API/1.0.0)

## To Override Deployment to AWS

Go to [.github/workflows/ci-cd.yml](https://github.com/shreyas-sriram/bookxchange-server/blob/main/.github/workflows/ci-cd.yaml), change `if` in `CD Pipeline` job to add your working branch. For example, if your working branch is `foo`, then modify as

```
if: github.ref == 'refs/heads/foo'
```

## Keeping It Generic

### Installing Packages

```
npm install --save-dev <package-name>
```

### Requires

Follow the order

- external libraries
- controllers
- middlewares
- models
- others

### Writing Tests

Please use comments for better understanding of tests

## Known Issues

### Pre-commit runs test instead of lint

Check if `.git/hooks/pre-commit` has the following :

```
#!/bin/sh
# husky
# Created by Husky v4.3.0 (https://github.com/typicode/husky#readme)
#   At: 08/11/2020, 15:14:37
#   From: /Users/shreyas/Desktop/BookXchange/bookxchange-server/node_modules/husky (https://github.com/typicode/husky#readme)
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
