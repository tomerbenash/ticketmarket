from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, JSON, DateTime, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY ## ADD HERE3
from .database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    registration_date = Column(DateTime, default=func.now())
    phone_number = Column(String)

    # Relationships
    sell_listings = relationship("SellListing", back_populates="seller")
    buy_requests = relationship("BuyRequest", back_populates="buyer")
    tickets_selling = relationship("Ticket", foreign_keys="Ticket.seller_id", back_populates="seller")
    tickets_bought = relationship("Ticket", foreign_keys="Ticket.buyer_id", back_populates="buyer")
    reviews_received = relationship("Review", foreign_keys="Review.seller_id", back_populates="seller")
    reviews_given = relationship("Review", foreign_keys="Review.buyer_id", back_populates="buyer")

    __table_args__ = (
        CheckConstraint("role IN ('Buyer', 'Seller', 'Both')"),
    )


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    price = Column(Float, nullable=False)
    seller_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    is_sold = Column(Boolean, default=False)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], back_populates="tickets_selling")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="tickets_bought")
    transactions = relationship("Transaction", back_populates="ticket")

    __table_args__ = (
        CheckConstraint("category IN ('Concert', 'Sports', 'Theater', 'Other')"),
    )


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey("tickets.ticket_id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    payment_method = Column(String, nullable=False)
    transaction_date = Column(DateTime, default=func.now())
    price = Column(Float)


    # Relationships
    ticket = relationship("Ticket", back_populates="transactions")

    __table_args__ = (
        CheckConstraint("payment_method IN ('Credit Card', 'PayPal', 'Bank Transfer')"),
    )


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buyer_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text)
    review_date = Column(DateTime, default=func.now())

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="reviews_given")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="reviews_received")

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5"),
    )


class SellListing(Base):
    __tablename__ = "sell_listings"

    sell_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    event_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    created_date = Column(DateTime, default=func.now())
    is_available = Column(Boolean, default=True) ## ADDED HERE


    # Relationships
    seller = relationship("User", back_populates="sell_listings")

    __table_args__ = (
        CheckConstraint("category IN ('Concert', 'Sports', 'Theater', 'Other')"),
    )


class BuyRequest(Base):
    __tablename__ = "buy_requests"

    request_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buyer_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    event_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    max_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    created_date = Column(DateTime, default=func.now())

    # Relationships
    buyer = relationship("User", back_populates="buy_requests")

    __table_args__ = (
        CheckConstraint("category IN ('Concert', 'Sports', 'Theater', 'Other')"),
    )
