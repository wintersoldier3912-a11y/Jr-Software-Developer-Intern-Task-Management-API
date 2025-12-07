# TaskFlow AI

**Description**:  
TaskFlow AI is a modern, production-oriented Task Management Dashboard built with React and TypeScript. It features a responsive UI styled with Tailwind CSS, local data persistence, and smart AI capabilities powered by the Google Gemini API. The application simulates a real-world CRUD environment with asynchronous service layers and optimistic UI updates.

**Tech stack**:  
*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI**: Google GenAI SDK (Gemini 2.5 Flash)
*   **Persistence**: LocalStorage (simulating a RESTful API via `taskService`)
*   **Icons**: Custom SVG Components

**Setup**:

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment:
    *   Create a `.env` file in the root directory.
    *   Add your Google Gemini API Key:
        ```env
        API_KEY=your_google_api_key_here
        ```
4.  Start the application:
    ```bash
    npm start
    ```

**Features & Architecture**:

*   **Task Management (CRUD)**: Create, Read, Update, and Delete tasks with simulated network latency.
*   **Smart AI Enhancements**:
    *   **Auto-Fill**: Click the "AI Fill" button in the form to generate descriptions, tags, and priority levels based on the task title.
    *   **Daily Insight**: Get a motivational summary or productivity tip based on your current workload.
*   **Filtering & Sorting**: Filter by Status (Todo, In Progress, Done), Priority, or Search text. Sort by Date or Priority.
*   **Visual Feedback**:
    *   Optimistic UI updates for status changes.
    *   "Celebration" animation when completing tasks.
    *   Loading skeletons and responsive layouts.

**Services**:

*   `services/taskService.ts`: Abstraction layer simulating a backend API with `setTimeout` and `localStorage`.
*   `services/geminiService.ts`: Direct integration with Google's GenAI SDK for generative features.

**Tests**:  
Run the test suite (if configured):
```bash
npm test
```

**Notes**:
*   **Persistence**: Data is stored in the browser's `localStorage` under the key `taskflow_db_v1`.
*   **Security**: For this demo, the API Key is accessed directly in the frontend. In a production environment, AI calls should be proxied through a backend to secure the credential.
*   **AI Model**: Uses `gemini-2.5-flash` for low-latency responses suitable for UI interactions.
