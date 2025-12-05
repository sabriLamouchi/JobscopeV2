# LinkedIn Job Scraper - Frontend

A modern Next.js 16 frontend for the LinkedIn Job Scraper API with shadcn/ui components.

## Architecture

- **Frontend**: Next.js 16 with Tailwind CSS
- **BFF Layer**: Next.js API Routes (`/api/scrape`, `/api/health`)
- **Backend**: Flask API (Scraping Microservice)
- **Future**: Analytics MS, AI/Gemini MS

## Quick Start

1. Install dependencies: `npm install`
2. Configure `.env.local`: Copy from `.env.example`
3. Start Flask backend: `python ../backend/linkedin.py`
4. Start frontend: `npm run dev`
5. Open http://localhost:3000

## Project Structure

- `app/page.tsx` - Main search UI
- `app/api/` - BFF endpoints
- `components/` - React components (SearchForm, JobCard, JobsList)
- `lib/types.ts` - TypeScript interfaces
- `lib/services/` - API service layer

## Features

 Modern responsive UI with dark mode
 Advanced search filters
 Real-time job scraping
 BFF API layer
 Backend health monitoring
 TypeScript & Tailwind CSS

See README for full documentation.
