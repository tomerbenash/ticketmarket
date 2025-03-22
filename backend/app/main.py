from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import users, tickets, sell_listings, buy_requests, reviews

# Create the database tables
models.Base.metadata.create_all(bind=engine)

# Create the FastAPI app
app = FastAPI(title="TicketMarket API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(tickets.router)
app.include_router(sell_listings.router)
app.include_router(buy_requests.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the TicketMarket API"}

