from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import json

app = FastAPI()

# Adicionar middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (ajuste conforme necessário)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, DELETE, PUT, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Modelo para os ativos da carteira
class Asset(BaseModel):
    symbol: str
    amount_in_usd: float
    leverage: int

class Portfolio(BaseModel):
    id: int
    user_id: int
    name: str
    total_amount: float
    exchange: str
    api_key: str
    api_secret: str
    assets: List[Asset]

# Modelo para o login
class LoginRequest(BaseModel):
    username: str
    password: str

# Simulação de um banco de dados
portfolios_db = [
    {
        "id": 1,
        "user_id": 1,
        "name": "Carteira 1",
        "total_amount": 1000.0,
        "exchange": "Bybit",
        "api_key": "chave-exemplo",
        "api_secret": "segredo-exemplo",
        "assets": [
            {"symbol": "GALAUSDT", "amount_in_usd": 333.33, "leverage": 1},
            {"symbol": "FLOWUSDT", "amount_in_usd": 333.33, "leverage": 1},
            {"symbol": "LUNAUSDT", "amount_in_usd": 333.33, "leverage": 1}
        ],
        "created_at": "2025-03-21T00:00:00"
    }
]

# Endpoint para login
@app.post("/login")
async def login(request: LoginRequest):
    # Simulação de autenticação (substitua por lógica real com banco de dados)
    if request.username == "user" and request.password == "pass":
        return {"user_id": 1}
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

# Endpoint para buscar as criptomoedas disponíveis
@app.get("/cryptos")
async def get_cryptos():
    try:
        with open("cryptos.json", "r") as file:
            cryptos = json.load(file)
        return cryptos
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Arquivo cryptos.json não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler cryptos.json: {str(e)}")

# Endpoint para buscar as carteiras de um usuário
@app.get("/portfolios/{user_id}")
async def get_portfolios(user_id: int):
    user_portfolios = [p for p in portfolios_db if p["user_id"] == user_id]
    return user_portfolios

# Endpoint para criar uma nova carteira
@app.post("/portfolios/{user_id}")
async def create_portfolio(user_id: int, portfolio: Portfolio):
    portfolio_dict = portfolio.dict()
    portfolio_dict["user_id"] = user_id
    portfolio_dict["created_at"] = datetime.now().isoformat()
    portfolios_db.append(portfolio_dict)
    return {"portfolio_id": portfolio_dict["id"]}

# Endpoint para excluir uma carteira
@app.delete("/portfolios/{portfolio_id}")
async def delete_portfolio(portfolio_id: int):
    global portfolios_db
    portfolio = next((p for p in portfolios_db if p["id"] == portfolio_id), None)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")
    portfolios_db = [p for p in portfolios_db if p["id"] != portfolio_id]
    return {"message": "Carteira excluída com sucesso"}

# Endpoint para atualizar uma carteira existente
@app.put("/portfolios/{portfolio_id}")
async def update_portfolio(portfolio_id: int, portfolio: Portfolio):
    global portfolios_db
    # Verifica se a carteira existe
    existing_portfolio = next((p for p in portfolios_db if p["id"] == portfolio_id), None)
    if not existing_portfolio:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")
    
    # Atualiza os dados da carteira
    portfolio_dict = portfolio.dict()
    portfolio_dict["user_id"] = existing_portfolio["user_id"]
    portfolio_dict["created_at"] = existing_portfolio["created_at"]
    # Remove a carteira antiga e adiciona a nova
    portfolios_db = [p for p in portfolios_db if p["id"] != portfolio_id]
    portfolios_db.append(portfolio_dict)
    return {"message": "Carteira atualizada com sucesso"}