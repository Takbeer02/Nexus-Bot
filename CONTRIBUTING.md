# Contributing to Nexus Bot

Thank you for considering contributing to Nexus Bot! We welcome contributions from everyone. Please follow these guidelines to ensure a smooth contribution process.

## How to Contribute

1. **Fork the Repository**
   - Click the "Fork" button on the top right of the repository page.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/nexus-bot.git
   cd nexus-bot
   ```

3. **Set Up the Development Environment**
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run the bot in development mode:
     ```bash
     npm run dev
     ```

4. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make Your Changes**
   - Follow the [Code Style Guide](docs/development.md#code-style-guide).
   - Add comments to explain complex logic.
   - Ensure your code is clean and remove redundant code.
   - If you add a new feature, update the documentation and add tests if possible.

6. **Test Your Changes**
   - Run tests:
     ```bash
     npm test
     ```
   - Fix linting issues:
     ```bash
     npm run lint:fix
     ```

7. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add your commit message here"
   ```

8. **Push to Your Fork and Create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Go to the original repository and open a Pull Request.
   - Fill out the PR template and describe your changes clearly.

## Code of Conduct

- Be respectful and inclusive.
- Provide constructive feedback.
- Report bugs or vulnerabilities responsibly.

## Need Help?
- Check the [docs/](docs/) folder for guides.
- Open an issue if you need support.

Thank you for helping make Nexus Bot better!
