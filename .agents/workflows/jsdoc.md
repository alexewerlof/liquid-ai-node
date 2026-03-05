---
description: Add jsdoc annotations to a file
---

Use JSDoc to improve the developer experience in the IDEs that support JSDoc syntax.

1. Go through all classes and functions and ensure their purpose is documented
2. Go through all the parameters and ensure that their type and purpose and default value are documented
3. Document any edge cases but don't overdo it because the code is the source of truth. Only add documentation for behaviors that may be unintuitive to the programmer or unexpected to the AI agents like yourself.

Update any exisiting JSDoc if the code has drifted from existing documentation.

Do not document test files. For tests, make sure that the descriptions are accurate.

**IMPORTANT**: make sure to _NOT_ change any logic. Your task is strictly limited to documenting the code that's already there not to modify or improve it.
