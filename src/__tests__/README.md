# Frontend Jest Test Suite

This folder contains Jest tests for all main frontend pages and key components in the project. Each test file covers rendering, basic content, and simple interactions for its respective page/component. The goal is to ensure that all main user flows and UI elements are covered by at least one test.

- Pages tested: Login, HomePage, GetStarted, all Employee and Admin pages, AboutUs, Blogs, Contact, Services
- Key components tested: Toast

To run all tests:

```
npx jest --coverage --silent=false
``` 