# LBFC - AI-Powered Movie Hub

LBFC is a high-performance, production-ready movie discovery platform built with Next.js 15, Firebase, and Google Genkit. It provides personalized recommendations, AI-powered search, and a sleek, responsive interface for film enthusiasts.

## 🚀 Features

- **AI-Powered Search**: Search for movies using natural language (e.g., "movies like Inception but with more action").
- **Smart Playlists**: Generate custom movie marathons based on mood, genre, or specific descriptions.
- **Dynamic Recommendations**: Personalized "For You" sections and mood-based picks.
- **Social Integration**: Follow other users and explore their saved collections.
- **Real-time Stats**: Visualize your viewing habits with beautiful charts.
- **OTT Discovery**: Find where your favorite movies are streaming (Netflix, Prime, etc.).
- **Mobile First**: Fully responsive design optimized for all screen sizes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: [Firebase (Auth & Firestore)](https://firebase.google.com/)
- **AI Engine**: [Google Genkit](https://github.com/firebase/genkit) + Gemini 2.5 Flash
- **Data Source**: [TMDB API](https://www.themoviedb.org/documentation/api)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- A Firebase Project
- A TMDB API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lbfc-movies.git
   cd lbfc-movies
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file in the root and add the following:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
   GOOGLE_GENAI_API_KEY=your_google_ai_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

This app is optimized for **Firebase App Hosting**. 

1. Push your code to GitHub.
2. Connect your repository in the Firebase Console under "App Hosting".
3. Configure your environment variables in the App Hosting settings.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
