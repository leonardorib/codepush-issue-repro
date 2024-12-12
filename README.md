This is a minimal reproducible example of an issue found with CodePush builds when using mobx-state-tree as a state manager.

The try/catch/finally blocks in the codepush bundle will behave differently in the state store when compared to the default bundle.

As demonstrated, there is a workaround. But there are still some problems:

- The developer must know about this difference beforehand when relying on CodePush builds
- If this is only a particular instance of a bigger problem, there might be others.
