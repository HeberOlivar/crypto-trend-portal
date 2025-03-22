# ~/backend/binance_service.py
from binance.client import Client

class BinanceService:
    def __init__(self, api_key: str, api_secret: str):
        self.client = Client(api_key, api_secret)

    def set_leverage(self, symbol: str, leverage: int):
        try:
            print(f"Tentando definir alavancagem para {symbol}: {leverage}x")
            response = self.client.futures_change_leverage(symbol=symbol, leverage=leverage)
            print(f"Sucesso ao definir alavancagem: {response}")
            return response
        except Exception as e:
            print(f"Erro ao definir alavancagem: {e}")
            return None

    def get_current_price(self, symbol: str):
        try:
            print(f"Tentando obter preço atual para {symbol}")
            ticker = self.client.futures_symbol_ticker(symbol=symbol)
            price = float(ticker["price"])
            print(f"Preço obtido para {symbol}: {price}")
            return price
        except Exception as e:
            print(f"Erro ao obter preço: {e}")
            return None

    def calculate_quantity(self, symbol: str, amount_in_usd: float, leverage: int):
        try:
            price = self.get_current_price(symbol)
            if price is None:
                print(f"Erro: Preço não obtido para {symbol}")
                return None
            effective_amount = amount_in_usd * leverage
            quantity = effective_amount / price
            # Ajustar precisão (exemplo: 3 casas decimais para BTCUSDT)
            quantity = round(quantity, 3)
            print(f"Quantidade calculada para {symbol}: {quantity} (amount_in_usd={amount_in_usd}, leverage={leverage}, price={price})")
            # Verificar tamanho mínimo (ajuste conforme o símbolo)
            if quantity < 0.001:
                print(f"Quantidade {quantity} abaixo do mínimo permitido")
                return None
            return quantity
        except Exception as e:
            print(f"Erro ao calcular quantidade: {e}")
            return None

    def create_futures_order(self, client_id: str, symbol: str, side: str, quantity: float, order_type: str = "MARKET", price: float = None):
        try:
            print(f"Tentando criar ordem: client_id={client_id}, symbol={symbol}, side={side}, quantity={quantity}, order_type={order_type}")
            order_params = {
                "symbol": symbol,
                "side": side,  # "BUY" ou "SELL"
                "type": order_type,  # "MARKET" ou "LIMIT"
                "quantity": quantity
            }
            if order_type == "LIMIT" and price is not None:
                order_params["price"] = price
                order_params["timeInForce"] = "GTC"  # Good Till Cancelled
            order = self.client.futures_create_order(**order_params)
            print(f"Sucesso ao criar ordem: {order}")
            return order
        except Exception as e:
            print(f"Erro ao criar ordem: {e}")
            return None

