from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/sell-listings",
    tags=["sell listings"],
    responses={404: {"description": "Not found"}},
)


# In app/routers/sell_listings.py
@router.post("/", response_model=schemas.SellListing, status_code=status.HTTP_201_CREATED)
def create_sell_listing(
        listing: schemas.SellListingBase,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    # Check if user is a seller or both
    if current_user.role not in ["Seller", "Both"]:
        raise HTTPException(status_code=403, detail="Only sellers can create sell listings")

    # Create new sell listing
    db_listing = models.SellListing(
        seller_id=current_user.user_id,
        event_name=listing.event_name,
        category=listing.category,
        event_date=listing.event_date,
        price=listing.price,
        quantity=listing.quantity
    )

    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)

    # Create tickets for the listing
    for _ in range(listing.quantity):
        db_ticket = models.Ticket(
            event_name=listing.event_name,
            category=listing.category,
            event_date=listing.event_date,
            price=listing.price,
            seller_id=current_user.user_id,
            is_sold=False
        )
        db.add(db_ticket)

    db.commit()

    # Check for matching buy requests
    matching_requests = db.query(models.BuyRequest).filter(
        models.BuyRequest.event_name == listing.event_name,
        models.BuyRequest.max_price >= listing.price,
        models.BuyRequest.event_date == listing.event_date
    ).all()

    # Return the listing with any matches
    return db_listing
@router.get("/", response_model=List[schemas.SellListing])
def read_sell_listings(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    listings = db.query(models.SellListing).offset(skip).limit(limit).all()
    return listings

@router.get("/{listing_id}", response_model=schemas.SellListing)
def read_sell_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(models.SellListing).filter(models.SellListing.sell_id == listing_id).first()
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Sell listing not found")
    return db_listing

