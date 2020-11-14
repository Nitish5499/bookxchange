[![Actions Status](https://github.com/shreyas-sriram/bookxchange-server/workflows/CI/CD/badge.svg)](https://github.com/shreyas-sriram/bookxchange-server/actions)

# bookxchange-server

The server-side API for the BookXchange Application.

# Commands

Run server

```
npm start
```

Test

```
npm run test
```

Test specific file

```
npm run test < path/to/file >
```

Lint - manual run

```
node_modules/.bin/eslint --fix './**/*.js'
```

## Swagger API documentation

Run the following command and open http://localhost:8002/ in browser to view documentation

```
npm run docs
```

# To Override Deployment to AWS

Go to [.github/workflows/ci-cd.yml](https://github.com/shreyas-sriram/bookxchange-server/blob/signup/.github/workflows/ci-cd.yaml), change `if` in `CD Pipeline` job to add your working branch. For example, if your working branch is `foo`, then modify as

```
if: github.ref == 'refs/heads/foo'
```

# Keeping It Generic

## Installing Packages

- installing packages - `npm install --save-dev <package-name>`

## Requires

- Follow the order
  - external libraries
  - controller
  - models
  - others

## Writing Tests

Please use comments for better understanding of tests
