# multiplayer-quiz-adonisjs
A scalable multiplayer game with real time updates


Steps to run the project locally

1. Install Docker - https://docs.docker.com/get-started/get-docker/


2. Clone this project

3.1
    With Docker
    In the root folder run - "docker compose up --build"
    
    OR

3.2 Without Docker:

    a. Start 
    PostgreSQL, 
    create database: quiz_game_dev

    b. Backend

    cd backend
    cp .env.example .env    # fill in DB credentials + JWT_SECRET
    npm install
    node ace migration:run
    node ace serve --hmr

    c. Frontend

    cd frontend
    npm install
    npm run dev

4. Then open http://localhost:5173 in your browser.

5. To terminate the project run - "docker compose down"



## Problem faced during building 
- written in file problem_faced_and_solution.md

## Project Overview
### Request flow:

Client Request → Route → Middleware (JWT auth) → Controller → Service → DAO (raw SQL) → JoinJS (result mapping) → PostgreSQL

### Realtime flow (during gameplay):

Player answers → WebSocket event → Server validates + writes to DB → Broadcasts score:update + rank:update to all players in the room


## Backend Project structure

- I have followed Spring boot project management structure, since its a small project, thus I have not made seperate modules. 
- Overview -> we have controller -> service -> DAO layes
- In parent folder we have migrations files, middleware, result maps, etc


### Database schema
- users table 
- refresh_tokens (to store logout status)
- quiz_session ( to store lobby details)
- session_players ( to store playes joined in the session)
- session_ansers ( to store submit answer in order to calculate leaderboard and rank)
- quizzes ( table to store quiz details)
- questions (to store questions details)
- options (to store option details)

