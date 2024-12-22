# ZMK Studio

ZMK Studio is a powerful and user-friendly graphical interface for configuring and managing ZMK firmware for custom keyboards. It provides a seamless experience for users to customize their keyboard layouts, manage key bindings, and interact with their devices.

## Overview

ZMK Studio offers a range of capabilities to enhance the user experience:

- **Graphical Keymap Editor**: Easily create and modify keymaps with a visual editor.
- **Device Management**: Connect to your keyboard via USB or Bluetooth and manage its settings.
- **Firmware Updates**: Flash new firmware to your device directly from the application.
- **Real-time Feedback**: Receive real-time notifications and feedback from your device.

For more detailed information on the features and capabilities of ZMK Studio, please visit the [ZMK Studio Documentation](https://zmk.dev/docs/features/studio#capabilities).

## Getting Started

To contribute to ZMK Studio, follow these steps:

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 22 or later)
- [npm](https://www.npmjs.com/) (version 10 or later)
- [Rust](https://www.rust-lang.org/tools/install) (for building Tauri applications)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/)

### Setup

1. **Clone the repository**:

   ```sh
   git clone https://github.com/zmkfirmware/zmk-studio.git
   cd zmk-studio
   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

3. **Run the development server**:

   ```sh
   npm run dev
   ```

   This will start the Vite development server and open the application in your default web browser.

### Building the Project

To build the project for production, run:

```sh
npm run build
```

This will compile the TypeScript code and bundle the application using Vite.

### Running Storybook

To develop and test UI components in isolation, you can use Storybook:

1. **Start Storybook**:

   ```sh
   npm run storybook
   ```

   This will start the Storybook server and open it in your default web browser.

2. **Build Storybook**:

   ```sh
   npm run build-storybook
   ```

   This will build the Storybook static site for deployment.

### Linting

To ensure code quality and consistency, you can run the linter:

```sh
npm run lint
```

This will run ESLint on the codebase and report any issues.

### Tauri Commands

For Tauri-specific commands, you can use:

1. **Run Tauri development server**:

   ```sh
   npm run tauri dev
   ```

   This will start the Tauri development server for building and testing the desktop application.

2. **Build Tauri application**:

   ```sh
   npm run tauri build
   ```

   This will build the Tauri desktop application for production.

## Contributing

We welcome contributions from the community! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with a descriptive message.
4. Push your changes to your fork.
5. Open a pull request to the main repository.

Please ensure your code adheres to the project's coding standards and passes all tests before submitting a pull request.

## License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for more details.

## Contact

For any questions or support, please open an issue on the [GitHub repository](https://github.com/zmkfirmware/zmk-studio/issues).

Happy coding!
