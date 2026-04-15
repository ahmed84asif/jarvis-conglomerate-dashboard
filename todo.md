# Jarvis Conglomerate Dashboard - Project TODO

## Phase 1: Project Planning & Setup
- [x] Initialize web-db-user scaffold with React + Express + tRPC
- [ ] Design and document database schema for all features
- [ ] Create Jarvis system prompt and persona definition
- [ ] Set up free Llama API provider (Groq or Together AI)
- [ ] Configure Telegram bot credentials

## Phase 2: Database Schema & Core Backend
- [ ] Create tables: conversations, messages, goals, briefings, org_structure, wealth_metrics
- [ ] Implement conversation memory persistence layer
- [ ] Build Jarvis agent service with LLM integration
- [ ] Add goal/task CRUD operations
- [ ] Set up daily briefing generation logic

## Phase 3: AI Agent & Backend Services
- [ ] Integrate Llama API (Groq/Together AI) with system prompt
- [ ] Implement context window management for agent memory
- [ ] Build agent response streaming for real-time chat
- [ ] Create briefing generation service
- [ ] Implement org-chart data structure and queries

## Phase 4: Web Dashboard UI
- [ ] Design premium dashboard layout (Chairman view)
- [ ] Build wealth metrics display (KPIs, charts, trends)
- [ ] Implement org-chart visualization (Chairman → Board → C-Suite → Managers → Workers)
- [ ] Create in-dashboard chat interface with message history
- [ ] Build goal/task tracker UI
- [ ] Implement recent insights display

## Phase 5: Chat & Messaging
- [ ] Create message input/output components
- [ ] Implement real-time message streaming UI
- [ ] Build message history display with pagination
- [ ] Add markdown rendering for agent responses
- [ ] Implement optimistic updates for chat UX

## Phase 6: Telegram Bot Integration
- [ ] Set up Telegram bot with webhook/polling
- [ ] Link Telegram messages to user sessions
- [ ] Implement message routing to Jarvis agent
- [ ] Add Telegram response formatting
- [ ] Test end-to-end Telegram communication

## Phase 7: Daily Briefing & Scheduling
- [ ] Implement briefing generation with world news context
- [ ] Build briefing scheduling (morning delivery)
- [ ] Create briefing display in dashboard
- [ ] Add briefing history/archive
- [ ] Implement Telegram briefing delivery

## Phase 8: Security & Styling
- [ ] Enforce owner-only access (authentication checks)
- [ ] Apply premium visual design (colors, typography, spacing)
- [ ] Implement role-based access control (Chairman vs others)
- [ ] Add security headers and CORS configuration
- [ ] Test authentication and authorization flows

## Phase 9: Testing & Deployment
- [ ] Write vitest tests for agent logic
- [ ] Write vitest tests for chat/messaging
- [ ] Write vitest tests for goal operations
- [ ] Test Telegram bot integration
- [ ] Test daily briefing generation
- [ ] Create Docker containerization for portability
- [ ] Create deployment guide for home server migration
- [ ] Final checkpoint and delivery

## Feature Checklist

### AI Agent (Jarvis)
- [ ] System prompt with billionaire wealth strategist persona
- [ ] Llama API integration (free tier)
- [ ] Context persistence across sessions
- [ ] Response streaming for real-time chat
- [ ] Multi-role capability (mentor, assistant, board member, strategist)

### Dashboard
- [ ] Owner-only access control
- [ ] Wealth metrics display (KPIs, charts)
- [ ] Org-chart visualization
- [ ] Goal/task tracker
- [ ] Recent insights panel
- [ ] Premium visual design

### Chat Interface
- [ ] In-dashboard chat window
- [ ] Message history storage
- [ ] Real-time message streaming
- [ ] Markdown rendering
- [ ] Optimistic updates

### Telegram Bot
- [ ] Message receiving and sending
- [ ] Session linking to dashboard user
- [ ] Real-time responses
- [ ] Formatted message output

### Daily Briefing
- [ ] Morning briefing generation
- [ ] World news context integration
- [ ] Wealth strategy updates
- [ ] Prioritized task list
- [ ] Scheduled delivery (dashboard + Telegram)

### Security
- [ ] Owner-only authentication
- [ ] Session management
- [ ] API key protection
- [ ] CORS and security headers
- [ ] Rate limiting

## Notes
- Use free-tier Llama API (Groq or Together AI) to avoid costs
- Containerize with Docker for easy migration to home server
- Store all conversations and context in database for persistence
- Jarvis persona must be enforced at system-prompt level
- Premium design aesthetic throughout
