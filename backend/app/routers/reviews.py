from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_review(
    review: schemas.ReviewBase, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if user is a buyer or both
    if current_user.role not in ["Buyer", "Both"]:
        raise HTTPException(status_code=403, detail="Only buyers can create reviews")
    
    # Check if the seller exists
    seller = db.query(models.User).filter(models.User.user_id == review.seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    
    # Check if there was a transaction between the buyer and seller
    transaction = db.query(models.Transaction).filter(
        models.Transaction.buyer_id == current_user.user_id,
        models.Transaction.seller_id == review.seller_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=400, 
            detail="You can only review sellers you've purchased from"
        )
    
    # Create new review
    db_review = models.Review(
        buyer_id=current_user.user_id,
        seller_id=review.seller_id,
        rating=review.rating,
        review_text=review.review_text
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/", response_model=List[schemas.Review])
def read_reviews(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    reviews = db.query(models.Review).offset(skip).limit(limit).all()
    return reviews

@router.get("/seller/{seller_id}", response_model=List[schemas.Review])
def read_seller_reviews(
    seller_id: int,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    reviews = db.query(models.Review).filter(
        models.Review.seller_id == seller_id
    ).offset(skip).limit(limit).all()
    return reviews

