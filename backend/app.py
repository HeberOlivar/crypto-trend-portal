# ~/backend/app.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from models.database import SessionLocal, engine, Base
from models.user import User, Portfolio, PortfolioAsset, Order, PortfolioPerformance
from services.bybit_service import BybitService
from apscheduler.schedulers.background import BackgroundScheduler
import logging
from datetime import datetime
import json

app = FastAPI()
Base.metadata.create_all(bind=engine)
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserLogin(BaseModel):
    username: str
    password: str

class PortfolioAssetCreate(BaseModel):
    symbol: str
    amount_in_usd: float
    leverage: int

class PortfolioCreate(BaseModel):
    name: str
    total_amount: float
    exchange: str
    api_key: str
    api_secret: str
    assets: List[PortfolioAssetCreate]

class TrendSignal(BaseModel):
    symbol: str
    trend: str
    amount_in_usd: float
    leverage: int

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return {"message": "Login bem-sucedido", "user_id": db_user.id}

@app.get("/portfolios/{user_id}", response_model=List[dict])
def get_portfolios(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return [
        {
            "id": p.id,
            "name": p.name,
            "total_amount": p.total_amount,
            "exchange": p.exchange,
            "api_key": p.api_key,
            "api_secret": p.api_secret,
            "assets": [{"symbol": a.symbol, "amount_in_usd": a.amount_in_usd, "leverage": a.leverage} for a in p.assets]
        } for p in db_user.portfolios
    ]

@app.post("/portfolios/{user_id}", response_model=dict)
def create_portfolio(user_id: int, portfolio: PortfolioCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if portfolio.exchange != "Bybit":
        raise HTTPException(status_code=400, detail="Apenas Bybit é suportada no momento")
    for asset in portfolio.assets:
        if asset.leverage not in [1, 2]:
            raise HTTPException(status_code=400, detail="Alavancagem deve ser 1 ou 2")
    
    db_portfolio = Portfolio(
        name=portfolio.name,
        total_amount=portfolio.total_amount,
        exchange=portfolio.exchange,
        api_key=portfolio.api_key,
        api_secret=portfolio.api_secret,
        user_id=user_id
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    for asset in portfolio.assets:
        db_asset = PortfolioAsset(
            portfolio_id=db_portfolio.id,
            symbol=asset.symbol,
            amount_in_usd=asset.amount_in_usd,
            leverage=asset.leverage
        )
        db.add(db_asset)
    db.commit()
    return {"message": "Carteira criada", "portfolio_id": db_portfolio.id}

@app.delete("/portfolios/{user_id}/{portfolio_id}", response_model=dict)
def delete_portfolio(user_id: int, portfolio_id: int, db: Session = Depends(get_db)):
    db_portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")
    db.delete(db_portfolio)
    db.commit()
    return {"message": "Carteira excluída com sucesso"}

@app.get("/cryptos", response_model=List[dict])  # Novo endpoint
def get_available_cryptos():
    with open("/home/ubuntu/backend/cryptos.json", "r") as f:
        cryptos = json.load(f)
    return cryptos

@app.post("/signal/{user_id}/{portfolio_id}", response_model=dict)
def receive_signal(user_id: int, portfolio_id: int, signal: TrendSignal, db: Session = Depends(get_db)):
    db_portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")
    if signal.leverage not in [1, 2]:
        raise HTTPException(status_code=400, detail="Alavancagem deve ser 1 ou 2")
    
    bybit = BybitService(db_portfolio.api_key, db_portfolio.api_secret, use_testnet=True)
    bybit.set_leverage(signal.symbol, signal.leverage)
    quantity = bybit.calculate_quantity(signal.symbol, signal.amount_in_usd, signal.leverage)
    if quantity is None:
        raise HTTPException(status_code=500, detail="Erro ao calcular quantidade")
    
    side = "Buy" if signal.trend == "up" else "Sell"
    order = bybit.create_futures_order(client_id=str(user_id), symbol=signal.symbol, side=side, quantity=quantity)
    if order is None:
        raise HTTPException(status_code=500, detail="Erro ao criar ordem")
    
    price = bybit.get_current_price(signal.symbol)
    db_order = Order(
        portfolio_id=portfolio_id,
        symbol=signal.symbol,
        side=side,
        quantity=quantity,
        entry_price=price,
        order_date=datetime.now().strftime("%Y-%m-%d")
    )
    db.add(db_order)
    db.commit()
    return {"message": f"Ordem criada para {signal.symbol}", "order": order}

@app.get("/portfolio/{portfolio_id}/performance", response_model=List[dict])
def get_performance(portfolio_id: int, db: Session = Depends(get_db)):
    return db.query(PortfolioPerformance).filter(PortfolioPerformance.portfolio_id == portfolio_id).all()

def update_performance():
    with SessionLocal() as db:
        portfolios = db.query(Portfolio).all()
        for portfolio in portfolios:
            bybit = BybitService(portfolio.api_key, portfolio.api_secret, use_testnet=True)
            total_value = 0
            for asset in portfolio.assets:
                price = bybit.get_current_price(asset.symbol)
                if price:
                    total_value += (asset.amount_in_usd * asset.leverage) * (price / asset.entry_price if asset.entry_price else 1)
            db_performance = PortfolioPerformance(
                portfolio_id=portfolio.id,
                date=datetime.now().strftime("%Y-%m-%d"),
                total_value=total_value
            )
            db.add(db_performance)
        db.commit()

scheduler = BackgroundScheduler()
scheduler.add_job(update_performance, 'cron', hour=21, minute=0)
scheduler.start()

@app.on_event("startup")
def startup():
    db = SessionLocal()
    if not db.query(User).filter(User.username == "user").first():
        db.add(User(username="user", password="pass"))
        db.commit()
    db.close()

