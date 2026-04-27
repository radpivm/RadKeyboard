# Radkeyboard v1.0

A feature-rich input method prototype built with React, Vite, and Tailwind CSS. It showcases advanced keyboard capabilities right in the browser, serving as a detailed blueprint for a fully-featured mobile keyboard application.

## 🚀 Features

- **Multiple Layouts**: Instantly switch between QWERTY, AZERTY, and DVORAK right from the keyboard interface.
- **Configurable Sizes**: Adjust the keyboard's height and key size dynamically in the Settings menu (Small, Medium, Large) for better ergonomics.
- **AI-Powered Auto-Translation**: Integrates directly with the Gemini API to let you type in your native language, translate it on the fly, and send the translated text. You can easily toggle between typing directly and using real-time translation.
- **Word Prediction**: Intelligent text prediction engine that suggests next words based on what you type.
- **Clipboard History**: Built-in clipboard manager to save and access recently copied text.
- **Emoji Picker**: Quick access to a full suite of emojis from a dedicated view.
- **Undo/Redo Navigation**: Includes dedicated arrow controls, plus undo and redo buttons for precise cursor movement and edit history tracking.
- **Advanced Controls**: Features a lockable `Ctrl` key, `Select All`, and fully manageable accelerator `App Shortcuts` (which you can add, reorder, or delete).
- **Beautiful Themes**: Beautiful handcrafted design with multiple gorgeous themes: Onyx (default), OLED, Material Dark, Material Light, and Pastel Pink.

## 💻 Running Locally

This is a standard React + Vite application. To run it locally:

1. Clone or download this repository.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Gemini API Key if you want to use the translation features (see `.env.example` if available)
   ```bash
   GEMINI_API_KEY="your_api_key_here"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📱 Important Note on Android Installation

The current version of **Radkeyboard v1.0** is a web-based prototype. To use this as a system-wide global Android keyboard on your phone, it must be rewritten natively inside Android Studio as an `InputMethodService` component.

Please strictly follow the detailed guide in the `next-steps.txt` file attached in this repository for step-by-step instructions on making it an installable global keyboard for your Android phone.
