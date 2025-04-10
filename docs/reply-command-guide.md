# Guide to Creating Reply Commands

## Basic Structure

Follow this structure to create a reply-based command:

```javascript
module.exports = {
  config: {
    name: "command-name",
    version: "1.0.0", 
    author: "your-name",
    countDown: 5,
    role: 0,
    shortDescription: "Short desc",
    longDescription: "Long desc",
    category: "your-category",
    guide: "{prefix}command"
  },

  async execute({ api, event }) {
    // Send first message
    const reply = await api.sendMessage("First message", event.threadID);

    // Register reply handler 
    global.client.handleReply.push({
      name: this.config.name,
      messageID: reply.messageID,
      author: event.senderID,
      type: "step_1",
      data: {} // Store additional data here
    });
  },

  async handleReply({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;

    // Only allow replies from original user
    if (senderID !== handleReply.author) return;

    switch(handleReply.type) {
      case "step_1":
        // Handle first reply
        const nextReply = await api.sendMessage(
          `You replied: ${body}\nReply again!`, 
          threadID
        );

        // Push handler for next step
        global.client.handleReply.push({
          name: this.config.name,
          messageID: nextReply.messageID,
          author: senderID,
          type: "step_2",
          data: {
            step1Answer: body
          }
        });
        break;

      case "step_2":
        // Handle second reply
        api.sendMessage(
          `Command complete!\nFirst answer: ${handleReply.data.step1Answer}\nSecond answer: ${body}`,
          threadID
        );
        break;
    }
  }
};
```

## Key Points

1. **Reply Handler Registration**
   - Use `global.client.handleReply.push()` to register reply handlers
   - Must include `name`, `messageID`, and `author` properties
   - Can include additional custom data in the `data` property

2. **Type Management**
   - Use different types for each step in the conversation
   - Handle types using switch-case statements
   - Types help track the conversation state

3. **Data Passing**
   - Store data in the `data` object to pass between steps
   - Access previous data through handleReply.data
   - Useful for building multi-step conversations

## Usage Example

To use a reply-based command:

1. Call the command (e.g., !command)
2. Reply to the first message
3. Reply to the second message
4. View the final result

## Security Considerations

- Always check `senderID !== handleReply.author`
- Validate all input data
- Add proper error handling
- Consider permission levels using `role`
- Implement timeout mechanisms

## Best Practices

1. **Spam Prevention**
   - Use `countDown` to prevent spam
   - Consider implementing cooldowns between replies
   - Add rate limiting if needed

2. **Permission Control**
   - Set appropriate `role` levels
   - Add additional permission checks if needed
   - Consider thread-specific permissions

3. **Documentation**
   - Clearly document each step
   - Include usage examples
   - Document expected inputs and outputs

4. **Error Handling**
   - Handle timeouts
   - Handle invalid inputs
   - Provide clear error messages

## Advanced Features

1. **Reaction Integration**
   - Combine with handleReaction
   - Allow both replies and reactions
   - Create interactive experiences

2. **Data Validation**
   - Validate user inputs
   - Handle edge cases
   - Provide feedback for invalid inputs

3. **State Management**
   - Track conversation state
   - Handle interrupted conversations
   - Clean up unused handlers

## Tips & Tricks

1. **Code Organization**
   - Separate logic into functions
   - Use clear type names
   - Comment complex logic

2. **User Experience**
   - Clear instructions
   - Helpful error messages
   - Progress indicators

3. **Performance**
   - Clean up handlers after use
   - Implement timeouts
   - Optimize data storage

## Common Patterns

1. **Multi-step Forms**
   ```javascript
   case "step_1":
     // Validate and store first answer
     // Move to next step
     break;
   ```

2. **Confirmation Flow**
   ```javascript
   case "confirm":
     if (body.toLowerCase() === 'yes') {
       // Process confirmation
     }
     break;
   ```

3. **Data Collection**
   ```javascript
   data: {
     responses: [],
     startTime: Date.now()
   }
   ```

Remember to always clean up handlers and implement proper error handling in your commands!
