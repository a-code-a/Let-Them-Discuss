# Historical Figures Chat

This project is a web application that allows users to chat with AI-generated personas of historical figures. It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## About the App

The "Historical Figures Chat" application provides an interactive way to learn about and engage with famous historical figures. Users can select a figure from a list and send messages, receiving responses that reflect the figure's personality, historical context, and areas of expertise.

**Key Features:**

- **Engaging Historical Interactions:** Chat with AI personas of Albert Einstein, Isaac Newton, and Galileo Galilei.
- **AI-Powered Responses:** Utilizes the Gemini Pro API to generate contextually relevant and informative responses.
- **Simple and Intuitive Interface:** Built with React for a smooth and user-friendly experience.

## Technologies Used

- **React:** A JavaScript library for building user interfaces. This project uses React components to create the interactive chat interface.
- **Create React App:** A toolchain for setting up a modern web app with sensible defaults.
- **Gemini Pro API:** A large language model from Google that powers the AI responses of the historical figures.
- **Node.js and npm:** The JavaScript runtime and package manager used for development and dependency management.

## Project Structure

The project follows the standard Create React App structure:

- `public/`: Contains static assets like `index.html` and images.
- `src/`: Contains the main application code.
  - `components/`: Houses the React components for the application, such as `App`, `Chat`, and `FigureSelection`.
  - `services/`: Contains services for interacting with the Gemini Pro API (`chatService.js`) and managing persona data (`personaService.js`).
  - `styles/`: Includes CSS files for styling the application.
  - `index.js`: The main entry point for the application.

## Getting Started

To run the app in development mode:

1. Ensure you have Node.js and npm installed.
2. Clone the repository.
3. Navigate to the project directory in your terminal.
4. Install dependencies: `npm install`
5. Start the development server: `npm start`
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
To learn React, check out the [React documentation](https://reactjs.org/).
