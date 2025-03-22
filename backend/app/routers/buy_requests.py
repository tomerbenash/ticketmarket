from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/buy-requests",
    tags=["buy requests"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.BuyRequest, status_code=status.HTTP_201_CREATED)
def create_buy_request(
    request: schemas.BuyRequestBase, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if user is a buyer or both
    if current_user.role not in ["Buyer", "Both"]:
        raise HTTPException(status_code=403, detail="Only buyers can create buy requests")
    
    # Create new buy request
    db_request = models.BuyRequest(
        buyer_id=current_user.user_id,
        event_name=request.event_name,
        category=request.category,
        event_date=request.event_date,
        max_price=request.max_price,
        quantity=request.quantity
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/", response_model=List[schemas.BuyRequest])
def read_buy_requests(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    requests = db.query(models.BuyRequest).offset(skip).limit(limit).all()
    return requests

@router.get("/{request_id}", response_model=schemas.BuyRequest)
def read_buy_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(models.BuyRequest).filter(models.BuyRequest.request_id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Buy request not found")
    return db_request

@router.get("/{request_id}/matches", response_model=List[schemas.SellListing])
def get_matching_listings(
    request_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Get the buy request
    db_request = db.query(models.BuyRequest).filter(
        models.BuyRequest.request_id == request_id,
        models.BuyRequest.buyer_id == current_user.user_id
    ).first()
    
    if db_request is None:
        raise HTTPException(status_code=404, detail="Buy request not found")
    
    # Find matching sell listings
    matching_listings = db.query(models.SellListing).filter(
        models.SellListing.event_name == db_request.event_name,
        models.SellListing.price <= db_request.max_price,
        models.SellListing.event_date == db_request.event_date
    ).all()
    
    return matching_listings

