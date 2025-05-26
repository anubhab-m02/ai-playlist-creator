# Mixtape Maestro 🎶🎧

Welcome to **Mixtape Maestro**, your personal AI-powered DJ for crafting the perfect playlist for any mood, moment, or memory! Built with React, Firebase, and the Gemini API, Mixtape Maestro brings back the nostalgic joy of creating mixtapes with a modern twist.

## ✨ Features

Mixtape Maestro is packed with features to make playlist creation intuitive, fun, and deeply personalized:

### Core Functionality:
* **User Authentication**: Secure sign-up and login using Firebase Authentication (Email/Password & Google Sign-In).
* **Create Mixtapes**:
    * **Themed Playlists**: Define a theme or title for your mixtape.
    * **AI Song Suggestions**: Leverage the Gemini API to get song recommendations based on your theme, seed songs, and advanced preferences.
    * **Seed Songs**: Kickstart your playlist with a few of your favorite tracks to guide the AI.
    * **Tags**: Add mood, activity, or genre tags to categorize your mixtapes.
    * **Liner Notes**: Write personal notes or a story for your mixtape, just like the old days! AI can also help generate these.
    * **Cover Art**: Add a visual touch by pasting an image URL for your mixtape cover.
    * **Song Reordering**: Drag and drop songs to get the perfect flow.
    * **Personal Song Notes**: Add a personal touch or memory to individual songs within your mixtape.
* **Dashboard**: View all your created mixtapes (active and archived).
* **Edit Mixtapes**: Modify any aspect of your existing mixtapes.
* **Delete Mixtapes**: Remove mixtapes you no longer need.
* **Remix Mixtapes**: Duplicate an existing mixtape to use as a starting point for a new creation.
* **Archive/Unarchive Mixtapes**: Keep your dashboard tidy by archiving older mixtapes, and bring them back whenever you want.

### AI-Powered Curation:
* **Gemini's Booth**: Get intelligent song suggestions from the Gemini API.
* **Title Suggestions**: Let the AI suggest creative titles based on your theme idea.
* **Liner Notes Generation**: AI can help craft engaging liner notes for your playlist.
* **Advanced AI Preferences**:
    * **Year Range**: Focus song suggestions within a specific era.
    * **Language Preferences**: Specify preferred languages for songs.
    * **Hidden Gems**: Ask the AI to prioritize lesser-known tracks.
    * **Exclude Keywords**: Filter out specific artists, genres, or keywords.
    * **Instrumental/Vocal Ratio**: Guide the AI on the balance of instrumental vs. vocal tracks.
    * **Cross-Genre Fusion**: Experiment by asking the AI to blend multiple genres.
    * **Storytelling Narrative**: Define a narrative arc for the AI to follow.
    * **Vibe Arc Description**: Describe the desired energy flow of the playlist.
* **Future Mixtape Ideas**: Get AI-generated suggestions for your next mixtape based on your current creation.

### User Experience & UI:
* **Stepper UI for Playlist Creation**: A guided, multi-step process for creating mixtapes, breaking down the form into:
    1.  **Foundation**: Theme, Tags, Seed Songs.
    2.  **Curate Songs**: AI Preferences, Song Suggestions, Building the Tracklist.
    3.  **Final Touches**: Cover Art, Liner Notes, Sharing Options.
* **Collapsible Sections**: Advanced AI preferences are collapsible to reduce clutter.
* **Duplicate Song Detection**: Get a warning if you try to add the same song twice, with an option to add anyway.
* **Bulk Tag Management**: Easily manage all tags for a playlist in a dedicated modal.
* **Responsive Design**: Enjoy a seamless experience across devices.
* **Visual Feedback**: Loading states, success/error alerts, and interactive elements.
* **Themed UI**: A dark, vibrant theme reminiscent of early 2000s aesthetics with modern polish.

## 🛠️ Tech Stack

* **Frontend**: React, Vite, Tailwind CSS
* **Backend & Database**: Firebase (Authentication, Firestore Database)
* **AI Integration**: Google Gemini API (via `gemini-2.0-flash` model)
* **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.x or later recommended)
* npm or yarn
* A Firebase project set up with Authentication (Email/Password and Google providers enabled) and Firestore.
* A Google Gemini API Key.

### Setup

1.  **Clone the repository (if applicable, otherwise ensure you have all project files):**
    ```bash
    git clone <https://github.com/anubhab-m02/ai-playlist-creator>
    cd mixtape-maestro 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Firebase Configuration:**
    * Locate the Firebase configuration in `src/firebase.jsx`.
    * Replace the placeholder `firebaseConfig` object with your actual Firebase project's configuration:
        ```javascript
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID",
          measurementId: "YOUR_MEASUREMENT_ID" // Optional
        };
        ```
    * **Important**: Ensure your Firestore security rules are set up appropriately. For development, you might start with rules that allow reads/writes if authenticated, but for production, you'll need more granular rules. A basic example for development:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow users to read and write their own data under artifacts/{appId}/users/{userId}
            match /artifacts/{appId}/users/{userId}/{document=**} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            // Public data (if any planned for future)
            // match /artifacts/{appId}/public/{document=**} {
            //   allow read: if true;
            //   allow write: if request.auth != null; // Example: only auth users can write public
            // }
          }
        }
        ```
        The application currently uses paths like `artifacts/mixtape-maestro-v2/users/{currentUser.uid}/playlists`.

4.  **Gemini API Key Configuration:**
    * Create a `.env` file in the root of your project.
    * Add your Gemini API key to this file:
        ```env
        VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```
    * The application accesses this key using `import.meta.env.VITE_GEMINI_API_KEY`.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should now be running, typically on `http://localhost:5173`.

## 📂 Project Structure (Key Components)

* `src/App.jsx`: Main application component, handles routing and overall layout.
* `src/firebase.jsx`: Firebase initialization and context provider.
* `src/components/`: Contains all UI components.
    * `AuthPage.jsx`: Handles user sign-in and sign-up.
    * `Dashboard.jsx`: Displays user's mixtapes.
    * `PlaylistCreator.jsx`: The main component for creating and editing mixtapes, manages the stepper UI.
    * `Step1Foundation.jsx`: First step of the playlist creation wizard.
    * `Step2Curation.jsx`: Second step, focusing on AI suggestions and song list.
    * `Step3FinalTouches.jsx`: Final step for cover, notes, and saving.
    * `PlaylistCard.jsx`: Displays individual mixtape cards on the dashboard.
    * `GeminiSuggestionsDisplay.jsx`: Shows AI-generated song ideas.
    * `CurrentMixtapeDisplay.jsx`: Shows the songs currently added to the mixtape being created.
    * `AdvancedAIPrefs.jsx`: Component for advanced AI curation options.
    * `Modal.jsx`: Reusable modal component.
    * `ManageTagsModal.jsx`: Modal for bulk editing tags.
    * `Header.jsx`, `Footer.jsx`: Site-wide header and footer.
    * `Alert.jsx`: For displaying success/error messages.

## 🎨 Styling

* **Tailwind CSS**: Used for utility-first CSS styling.
* **Global Styles**: `src/index.css` (imports Tailwind) and `src/App.css` (for any custom global styles, though minimal).
* **Custom Scrollbar**: Some scrollable areas use custom scrollbar styling defined in `src/index.css` or an equivalent global style sheet.

## 퓨 Future Enhancements (Ideas from Feature List)

This project has a rich backlog of potential features to further enhance user engagement:

* **Deeper AI Personalization**: User taste profiles, interactive feedback on AI suggestions.
* **Enhanced UI/UX & "Early 2000s Spirit"**: Themed animations, pop-ups, loading states.
* **Profile Customization**: Avatars, bios.
* **Social & Community**: Public share pages, "Mixtape Exchange" gallery, commenting.
* **Gamification**: Mixtape challenges, achievement badges.

...and many more!

---

