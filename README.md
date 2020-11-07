[![Actions Status](https://github.com/shreyas-sriram/bookxchange-server/workflows/CI/CD/badge.svg)](https://github.com/shreyas-sriram/bookxchange-server/actions)

# bookxchange-server

The server-side API for the BookXchange Application.

# To Run Locally

Run

```
npm start
```

# To Override Deployment to AWS

Go to [.github/workflows/ci-cd.yml](https://github.com/shreyas-sriram/bookxchange-server/blob/signup/.github/workflows/ci-cd.yaml), change `if` in `CD Pipeline` job to add your working branch. For example, if your working branch is `foo`, then modify as

```
if: github.ref == 'refs/heads/foo'
```

# Keeping It Generic

- installing packages - `npm install --save-dev <package-name>`
