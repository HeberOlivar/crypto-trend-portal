# ~/backend/models/user.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)  # Hash na produção
    portfolios = relationship("Portfolio", back_populates="user")

class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="Em Criação")
    total_amount = Column(Float)
    exchange = Column(String, default="Bybit")  # Nova coluna
    api_key = Column(String)  # Credenciais por carteira
    api_secret = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="portfolios")
    assets = relationship("PortfolioAsset", back_populates="portfolio")
    orders = relationship("Order", back_populates="portfolio")

class PortfolioAsset(Base):
    __tablename__ = "portfolio_assets"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    symbol = Column(String)
    amount_in_usd = Column(Float)
    leverage = Column(Integer)  # Limitado a 1 ou 2
    portfolio = relationship("Portfolio", back_populates="assets")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    symbol = Column(String)
    side = Column(String)  # "Buy" ou "Sell"
    quantity = Column(Float)
    entry_price = Column(Float)
    order_date = Column(String)  # ISO format, ex.: "2025-03-23"
    portfolio = relationship("Portfolio", back_populates="orders")

class PortfolioPerformance(Base):
    __tablename__ = "portfolio_performance"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    date = Column(String)  # Ex.: "2025-03-23"
    total_value = Column(Float)  # Valor atualizado às 21h

