from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
# from fastapi import Body
# from typing import Optional
router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Ticket, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket: schemas.TicketCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if user is a seller or both
    if current_user.role not in ["Seller", "Both"]:
        raise HTTPException(status_code=403, detail="Only sellers can create tickets")
    
    # Create new ticket
    db_ticket = models.Ticket(
        event_name=ticket.event_name,
        category=ticket.category,
        event_date=ticket.event_date,
        price=ticket.price,
        seller_id=current_user.user_id
    )
    
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.get("/", response_model=List[schemas.Ticket])
def read_tickets(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    tickets = db.query(models.Ticket).filter(models.Ticket.is_sold == False).offset(skip).limit(limit).all()
    return tickets

@router.get("/{ticket_id}", response_model=schemas.Ticket)
def read_ticket(ticket_id: int, db: Session = Depends(get_db)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket


@router.get("/user/{user_id}", response_model=List[schemas.Ticket])
def get_user_tickets(user_id: int, db: Session = Depends(get_db)):
    """Get all tickets purchased by a specific user"""
    # Print for debugging
    print(f"Fetching tickets for user ID: {user_id}")

    # Query tickets with the specified buyer_id
    tickets = db.query(models.Ticket).filter(models.Ticket.buyer_id == user_id).all()

    # Print results for debugging
    print(f"Found {len(tickets)} tickets for user {user_id}")
    for ticket in tickets:
        print(f"Ticket {ticket.ticket_id}: buyer_id={ticket.buyer_id}, is_sold={ticket.is_sold}")

    return tickets


@router.put("/{ticket_id}/buy", response_model=schemas.Ticket)
def buy_ticket(
        ticket_id: int,
        # matched_request_id: Optional[int] = Body(None), ## ADDED 3
        db: Session = Depends(get_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    # Check if user is a buyer or both
    if current_user.role not in ["Buyer", "Both"]:
        raise HTTPException(status_code=403, detail="Only buyers can purchase tickets")

    # Get the ticket
    db_ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Check if ticket is already sold
    if db_ticket.is_sold:
        raise HTTPException(status_code=400, detail="Ticket is already sold")

    # Update ticket
    db_ticket.buyer_id = current_user.user_id
    db_ticket.is_sold = True

    # if matched_request_id: ## ADDED 4
    #     db_request = db.query(models.BuyRequest).filter(models.BuyRequest.request_id == matched_request_id).first()
    #     if db_request:
    #         db_request.fulfilled = True
    #         db.commit()

    # Create transaction
    db_transaction = models.Transaction(
        ticket_id=db_ticket.ticket_id,
        seller_id=db_ticket.seller_id,
        buyer_id=current_user.user_id,
        payment_method="Credit Card"  # Default payment method
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket




