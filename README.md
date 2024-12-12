This is a minimal reproducible example of an issue found with CodePush builds when using mobx-state-tree as a state manager.

The try/catch/finally blocks in the codepush bundle will behave differently in the state store when compared to the default bundle.

As demonstrated, there is a workaround. But there are still some problems:

- The developer must know about this difference beforehand when relying on CodePush builds
- If this is only a particular instance of a bigger problem, there might be others.

### Release build - Without the CodePush bundle

Works as expected:

https://github.com/user-attachments/assets/aeba6a22-4ab6-4b8e-9e5f-6c4f44202784

### Release build - Running a CodePush bundle

Has unexpected errors:

https://github.com/user-attachments/assets/e125300f-b4d2-458d-b1b1-e13549ea0841

