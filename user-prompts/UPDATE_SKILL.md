Review the `workleap-logging` skill in the `./agent-skills/workleap-logging` directory and make sure that all API definition and examples match the current documentation available in the `./docs` folder. Ignore any documentation related to updates. Do not make mistake.

Never update a versioned skill. You can identify a versioned skill with its folder name pattern, e.g. `workleap-logging-v*`.

After making changes to the skill, spawn a review agent using the **opus** model to validate that the skill can still answer the following questions:

* What is @workleap/logging and what problems does it solve?
* How do you install @workleap/logging?
* What logger types are available and when do you use each?
* How do you create a BrowserConsoleLogger with a minimum log level?
* How do you create a CompositeLogger with multiple underlying loggers?
* What are the five log levels and their intended severity order?
* How do you use chained segments to build complex log entries?
* What happens if you forget to call a log level method at the end of a chain?
* How do you apply styles (color, font weight, background) to log text?
* How do you insert line breaks between segments?
* What are scopes and how do you start and end one?
* How do you dismiss a scope without outputting its entries?
* How do you style scope labels at creation and at end?
* What is the difference between `Logger` and `RootLogger`, and when must you cast?
* How do you integrate @workleap/logging with LogRocket?
* What is `createCompositeLogger` and what are its parameters?
* What are the recommended log levels for development vs production?
* How do you set up environment-based logger configuration?
* How do you properly log errors with context (object data and stack trace)?
* What are common mistakes when using @workleap/logging?
* What should you check when reviewing a PR that changes logging code?

