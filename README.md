# Career Profiling System

An AI-driven career planning tool that helps users create comprehensive career profiles through structured experience analysis and intelligent recommendations.

## 🚀 Features

- **Goal Setting**: Define career objectives with AI-powered industry recommendations
- **Experience Cards**: Transform experiences into structured, analyzable building blocks
- **Smart Combinations**: Get intelligent suggestions for optimal experience combinations
- **Career Profile**: Generate comprehensive insights and personalized job recommendations
- **PDF Export**: Export complete career profiles and recommendations

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **State Management**: Zustand with Immer
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **File Handling**: React Dropzone
- **Charts**: Recharts (planned)
- **AI Integration**: Google Gemini API
- **PDF Export**: @react-pdf/renderer (planned)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── goal/              # Goal setting pages
│   ├── experience/        # Experience card pages
│   ├── combination/       # Card combination pages
│   ├── result/           # Results and profile pages
│   └── api/              # API routes
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   ├── layout/          # Layout components
│   ├── cards/           # Card-related components
│   ├── upload/          # File upload components
│   ├── visualization/   # Data visualization components
│   └── export/          # Export-related components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── __tests__/           # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd career-profiling-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Current Development Status

### ✅ Completed (Phase 1 & 2)
- **Homepage**: Goal input interface with file upload
- **Goal Setting Page**: Dual-panel layout with industry recommendations
- **Gemini AI Integration**: Industry analysis and recommendation generation
- **Industry Cards**: Interactive cards with detailed information
- **Selection System**: Single industry selection with visual feedback

### 🚧 In Development
- **Experience Card Generation**: Transform user experiences into structured cards
- **Card Combination System**: Intelligent experience combination recommendations

### 📅 Planned Features
- **Career Profile Generation**: Comprehensive career insights
- **Job Recommendations**: Personalized job matching
- **PDF Export**: Complete profile export functionality

## 🎯 Usage

1. **Set Goals**: Start by defining your career objectives
2. **Upload Files**: Add resumes, portfolios, or other relevant documents
3. **Create Cards**: Generate and edit experience cards from your materials
4. **Combine Cards**: Select optimal combinations for your target roles
5. **View Results**: Get your career profile and job recommendations
6. **Export**: Download your complete profile as PDF

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind CSS for styling
- Implement proper error handling
- Add JSDoc comments for complex functions

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Self-hosting

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Status**: 🚧 In Development - Basic architecture completed, core features in progress
