# Project Structure

The project has been reorganized into a more maintainable structure:

```
src/
├── components/           # React components
│   ├── App/             # Main application component
│   ├── Chat/            # Chat interface component
│   └── FigureSelection/ # Historical figure selection component
├── services/            # Business logic and API calls
│   └── chatService.js   # Chat-related services
├── styles/              # CSS and styling files
│   └── App.css         # Main application styles
└── index.js            # Application entry point

```

## Folder Structure Explanation

- `components/`: Contains all React components, each in its own folder with related files
  - `App/`: Main application component
  - `Chat/`: Handles the chat interface and messaging
  - `FigureSelection/`: Manages the selection of historical figures
- `services/`: Contains business logic and API integration
  - `chatService.js`: Handles chat-related operations and API calls
- `styles/`: Contains all CSS and styling files
- Root level files remain for application configuration and entry points