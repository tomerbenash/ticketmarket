#from fastapi import APIRouter, Depends
#from sqlalchemy.orm import Session
#from .. import models, database, schemas

#router = APIRouter()

#@router.get("/transactions", response_model=list[schemas.Transaction])
#def get_all_transactions(db: Session = Depends(database.get_db)):
#    return db.query(models.Transaction).all()


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database, schemas

router = APIRouter()

@router.get("/transactions", response_model=list[schemas.Transaction])
def get_all_transactions(db: Session = Depends(database.get_db)):
    results = (
        db.query(
            models.Transaction.transaction_id,
            models.Transaction.buyer_id,
            models.Transaction.seller_id,
            models.Transaction.ticket_id,
            models.Transaction.price,
            models.Transaction.transaction_date,
            models.Ticket.event_name
        )
        .join(models.Ticket, models.Transaction.ticket_id == models.Ticket.ticket_id)
        .all()
    )

    return [
        {
            "transaction_id": r[0],
            "buyer_id": r[1],
            "seller_id": r[2],
            "ticket_id": r[3],
            "price": r[4],
            "transaction_date": r[5],
            "event_name": r[6],
        }
        for r in results
    ]