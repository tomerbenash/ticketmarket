from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import date, datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str
    phone_number: Optional[str] = None

    @validator('role')
    def validate_role(cls, v):
        if v not in ['Buyer', 'Seller', 'Both']:
            raise ValueError('Role must be Buyer, Seller, or Both')
        return v

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    user_id: int
    registration_date: datetime

    class Config:
        orm_mode = True

# Ticket schemas
class TicketBase(BaseModel):
    event_name: str
    category: str
    event_date: date
    price: float

    @validator('category')
    def validate_category(cls, v):
        if v not in ['Concert', 'Sports', 'Theater', 'Other']:
            raise ValueError('Category must be Concert, Sports, Theater, or Other')
        return v

class TicketCreate(TicketBase):
    seller_id: int

class Ticket(TicketBase):
    ticket_id: int
    seller_id: int
    buyer_id: Optional[int] = None
    is_sold: bool = False

    class Config:
        orm_mode = True

# Transaction schemas
class TransactionBase(BaseModel):
    ticket_id: int
    seller_id: int
    buyer_id: int
    payment_method: str

    @validator('payment_method')
    def validate_payment_method(cls, v):
        if v not in ['Credit Card', 'PayPal', 'Bank Transfer']:
            raise ValueError('Payment method must be Credit Card, PayPal, or Bank Transfer')
        return v

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    transaction_id: int
    transaction_date: datetime

    class Config:
        orm_mode = True

# Review schemas
class ReviewBase(BaseModel):
    seller_id: int
    rating: int
    review_text: Optional[str] = None

    @validator('rating')
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class ReviewCreate(ReviewBase):
    buyer_id: int

class Review(ReviewBase):
    review_id: int
    buyer_id: int
    review_date: datetime

    class Config:
        orm_mode = True

# Sell Listing schemas
class SellListingBase(BaseModel):
    event_name: str
    category: str
    event_date: date
    price: float
    quantity: int

    @validator('category')
    def validate_category(cls, v):
        if v not in ['Concert', 'Sports', 'Theater', 'Other']:
            raise ValueError('Category must be Concert, Sports, Theater, or Other')
        return v

class SellListingCreate(SellListingBase):
    seller_id: int

class SellListing(SellListingBase):
    sell_id: int
    seller_id: int
    created_date: datetime

    class Config:
        orm_mode = True

# Buy Request schemas
class BuyRequestBase(BaseModel):
    event_name: str
    category: str
    event_date: date
    max_price: float
    quantity: int

    @validator('category')
    def validate_category(cls, v):
        if v not in ['Concert', 'Sports', 'Theater', 'Other']:
            raise ValueError('Category must be Concert, Sports, Theater, or Other')
        return v

class BuyRequestCreate(BuyRequestBase):
    buyer_id: int

class BuyRequest(BuyRequestBase):
    request_id: int
    buyer_id: int
    created_date: datetime

    class Config:
        orm_mode = True

# Match notification schema
class MatchNotification(BaseModel):
    buy_request: BuyRequest
    matching_listings: List[SellListing]

