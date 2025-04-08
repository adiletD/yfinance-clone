# Yahoo Finance Clone

A full-stack web application that replicates Yahoo Finance's stock analysis features with custom estimate capabilities. Users can view stock data, analyst recommendations, and create personalized earnings, revenue, and growth estimates.

## Features

- **Stock Information**: View detailed stock information including price, change, market cap, and trading volume
- **Analyst Ratings**: See analyst consensus recommendations and price targets
- **Custom Estimates**: Create and save personalized estimates for:
  - Earnings per share (EPS)
  - Revenue 
  - Growth projections
- **User Authentication**: Register and login to save your custom estimates
- **Guest Mode**: Create estimates without an account (stored locally in browser)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

### Frontend
- **React**: UI library for building the user interface
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Component library built on Radix UI
- **TanStack Query**: Data fetching and caching
- **React Hook Form**: Form handling with validation
- **Wouter**: Lightweight routing solution
- **Zod**: Schema validation

### Backend
- **Express.js**: Node.js web framework
- **FastAPI**: Python web framework for the additional API endpoints
- **PostgreSQL**: Database for storing user data and estimates
- **Drizzle ORM**: TypeScript ORM for database operations
- **Passport.js**: Authentication middleware

## Project Structure

- `/api`: FastAPI backend routes and services
- `/client`: React frontend application
- `/server`: Express.js backend
- `/shared`: Shared TypeScript types and schemas

## Data Flow

1. Stock data is fetched from Yahoo Finance API (or mocked data in development)
2. Users can view analyst estimates and create their own custom estimates
3. Custom estimates are stored in the database for registered users or localStorage for guests
4. Estimates can be compared side-by-side with Yahoo Finance's official estimates

## Getting Started

1. Clone the repository
2. Install dependencies
3. Start the development server
4. Open your browser and navigate to the local server address

## Database Schema

The application uses the following database tables:
- `users`: Store user information
- `earnings_estimates`: Store users' custom EPS estimates
- `revenue_estimates`: Store users' custom revenue estimates
- `growth_estimates`: Store users' custom growth estimates

## Authentication

The application implements a secure authentication system with:
- Password hashing using bcrypt
- JWT tokens for maintaining sessions
- Protected routes for authorized operations

## Local Storage

For guest users, the application stores estimates in the browser's localStorage with the following structure:
- `guest-earnings-estimates`: EPS estimates
- `guest-revenue-estimates`: Revenue estimates  
- `guest-growth-estimates`: Growth estimates

## Potential Improvements

### Technical Improvements
1. **Real API Integration**: Replace mock data with actual Yahoo Finance API integration
2. **Enhanced Authentication**: Add OAuth providers (Google, GitHub) for easier signup
3. **State Management**: Implement Redux or Zustand for more complex state requirements
4. **Performance Optimization**: Add code splitting and lazy loading for larger components
5. **Testing**: Add unit and integration tests with Jest and Testing Library
6. **Progressive Web App**: Convert to PWA for offline capabilities
7. **GraphQL**: Replace REST endpoints with GraphQL for more efficient data fetching
8. **WebSockets**: Add real-time updates for stock prices

### Feature Improvements
1. **Watchlists**: Allow users to create and manage watchlists of favorite stocks
2. **Portfolio Tracking**: Enable users to track their investments
3. **Social Features**: Share estimates with other users
4. **Alerts**: Set up price alerts for stocks
5. **Historical Analysis**: Compare estimates against actual performance
6. **Advanced Charts**: Add technical analysis charts
7. **News Integration**: Display relevant news for each stock
8. **Export Functionality**: Export estimates to CSV/PDF
9. **Mobile App**: Create native mobile applications with React Native
10. **AI-Powered Recommendations**: Implement machine learning for personalized stock recommendations

## License

MIT
