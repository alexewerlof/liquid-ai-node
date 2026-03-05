All files in this directory wrap the message object from the OpenAI API.

The `BaseWMsg` class is the base class for all wrapped messages. It only has the `role` property.
The `ContentWMsg` class is the base class for all wrapped messages that have a `content` property and used by sugar classes:

- `UserWMsg`
- `AssistantWMsg`
- `SystemWMsg`

The `ToolCallWMsg` class is a special case of `BaseWMsg` that has an array of tool calls requests.
The `ToolResultWMsg` class is a special case of `ContentWMsg` that has a `tool_call_id` property.

Each of these classes have static `isXXXMsgObj` methods to check if a message object has a valid format and can be wrapped.
Each of these classes also have a `toJSON()` method to convert the object to a message object compatible with the OpenAI API.
