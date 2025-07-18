# AquaVision DRL - Water Network Control Platform

## Overview

AquaVision DRL is a water distribution network management platform that combines hydraulic simulation (EPANET) with Deep Reinforcement Learning (DRL) for intelligent control optimization. The application provides real-time monitoring, control, and AI-powered optimization of water distribution systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application follows a monorepo pattern with clear separation between client, server, and shared code:
- **Client**: React frontend with TypeScript
- **Server**: Express.js backend with TypeScript
- **Shared**: Common schemas, types, and utilities

### Technology Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn/ui components
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSockets
- **State Management**: TanStack Query (React Query)
- **Simulation**: EPANET-JS integration (simulated)
- **AI/ML**: Deep Reinforcement Learning services (simulated TensorFlow.js)

## Key Components

### Frontend Architecture
- **Component Library**: Radix UI primitives with custom Shadcn/ui styling
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: TailwindCSS with CSS variables for theming
- **State Management**: React Query for server state, local React state for UI
- **Real-time Updates**: Custom WebSocket client with reconnection logic

### Backend Architecture
- **API Layer**: RESTful endpoints organized by resource
- **Service Layer**: Separate services for EPANET simulation and DRL training
- **Data Access**: Storage abstraction with in-memory implementation
- **Real-time**: WebSocket server for live updates
- **Middleware**: Request logging, error handling, CORS

### Database Schema
Core entities include:
- **Networks**: Water distribution network definitions
- **DRL Models**: Machine learning model configurations and state
- **Network Metrics**: Time-series performance data
- **Pumps/Valves**: Controllable infrastructure components
- **Events**: System alerts and notifications

## Data Flow

### Client-Server Communication
1. **REST API**: CRUD operations for networks, models, and control commands
2. **WebSocket**: Real-time updates for metrics, training progress, and alerts
3. **Query Caching**: React Query manages server state with automatic invalidation

### Simulation Pipeline
1. **Network Loading**: EPANET service loads INP files and initializes simulation
2. **Metrics Collection**: Periodic sampling of network performance
3. **DRL Training**: Reinforcement learning agent learns optimal control policies
4. **Control Application**: AI-recommended actions applied to network components

### Real-time Updates
- Network status changes broadcast via WebSocket
- Training progress updates stream to dashboard
- Control updates sync across all connected clients

## External Dependencies

### Database Integration
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Built-in connection management

### UI Components
- **Radix UI**: Accessible primitive components
- **Lucide Icons**: Consistent iconography
- **TailwindCSS**: Utility-first styling system

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast production builds

### Future Integrations
- **EPANET-JS**: Hydraulic simulation engine
- **TensorFlow.js**: Machine learning runtime
- **Chart Libraries**: Data visualization components

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **TSX**: TypeScript execution for backend development
- **Concurrent Development**: Single command starts both client and server

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code for Node.js
- **Assets**: Static files served from Express in production

### Database Management
- **Migrations**: Drizzle Kit handles schema changes
- **Environment Variables**: DATABASE_URL configures connection
- **Schema Validation**: Zod schemas ensure data integrity

### Monitoring and Logging
- **Request Logging**: Structured API request/response logging
- **Error Handling**: Centralized error middleware
- **WebSocket Monitoring**: Connection state tracking

The application is designed for scalability and maintainability, with clear separation of concerns and type safety throughout the stack. The simulated EPANET and DRL services provide a foundation for integrating real hydraulic simulation and machine learning capabilities.
