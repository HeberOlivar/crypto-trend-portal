# ~/backend/services/bybit_service.py
from pybit.unified_trading import HTTP
import logging

logging.basicConfig(level=logging.INFO)

class BybitService:
    def __init__(self, api_key: str, api_secret: str, use_testnet: bool = False):
        self.client = HTTP(api_key=api_key, api_secret=api_secret, testnet=use_testnet)

    def get_symbol_info(self, symbol: str):
        try:
            logging.info(f"Tentando obter informações do símbolo {symbol}")
            response = self.client.get_instruments_info(category="linear", symbol=symbol)
            if response["retCode"] != 0:
                raise Exception(f"Erro na API: {response['retMsg']}")
            info = response["result"]["list"][0]
            symbol_info = {
                "qtyStep": float(info["lotSizeFilter"]["qtyStep"]),
                "minOrderQty": float(info["lotSizeFilter"]["minOrderQty"]),
                "maxOrderQty": float(info["lotSizeFilter"]["maxOrderQty"])
            }
            logging.info(f"Informações do símbolo {symbol}: {symbol_info}")
            return symbol_info
        except Exception as e:
            logging.error(f"Erro ao obter informações do símbolo: {e}")
            return None

    def set_leverage(self, symbol: str, leverage: int):
        logging.info(f"Tentando definir alavancagem para {symbol}: {leverage}x")
        try:
            response = self.client.set_leverage(
                category="linear",
                symbol=symbol,
                buyLeverage=str(leverage),
                sellLeverage=str(leverage)
            )
            # A biblioteca pybit pode lançar exceção para retCode != 0, mas vamos verificar o response
            ret_code = response.get("retCode", -1)
            if ret_code == 0:
                logging.info(f"Sucesso ao definir alavancagem: {response}")
                return response
            elif ret_code == 110043:
                logging.info(f"Alavancagem já definida como {leverage}x, ignorando alteração")
                return {"retCode": 0, "retMsg": "Leverage unchanged"}
            else:
                logging.error(f"Erro na API: {response.get('retMsg', 'Erro desconhecido')} (ErrCode: {ret_code})")
                return None
        except Exception as e:
            error_msg = str(e)
            if "leverage not modified" in error_msg.lower() and "110043" in error_msg:
                logging.info(f"Alavancagem já definida como {leverage}x, ignorando alteração (exceção capturada)")
                return {"retCode": 0, "retMsg": "Leverage unchanged"}
            else:
                logging.error(f"Erro inesperado ao definir alavancagem: {error_msg}")
                return None

    def get_current_price(self, symbol: str):
        try:
            logging.info(f"Tentando obter preço atual para {symbol}")
            response = self.client.get_tickers(category="linear", symbol=symbol)
            price = float(response["result"]["list"][0]["lastPrice"])
            logging.info(f"Preço obtido para {symbol}: {price}")
            return price
        except Exception as e:
            logging.error(f"Erro ao obter preço: {e}")
            return None

    def calculate_quantity(self, symbol: str, amount_in_usd: float, leverage: int):
        try:
            price = self.get_current_price(symbol)
            symbol_info = self.get_symbol_info(symbol)
            if price is None or symbol_info is None:
                return None
            
            effective_amount = amount_in_usd * leverage
            quantity = effective_amount / price
            
            qty_step = symbol_info["qtyStep"]
            min_qty = symbol_info["minOrderQty"]
            max_qty = symbol_info["maxOrderQty"]
            
            quantity = round(quantity / qty_step) * qty_step
            if quantity < min_qty:
                logging.warning(f"Quantidade {quantity} menor que o mínimo {min_qty}, ajustando para o mínimo")
                quantity = min_qty
            if quantity > max_qty:
                raise ValueError(f"Quantidade {quantity} excede o máximo permitido ({max_qty})")
            
            logging.info(f"Quantidade ajustada para {symbol}: {quantity} (amount_in_usd={amount_in_usd}, leverage={leverage}, price={price}, qtyStep={qty_step})")
            return quantity
        except Exception as e:
            logging.error(f"Erro ao calcular quantidade: {e}")
            return None

    def create_futures_order(self, client_id: str, symbol: str, side: str, quantity: float):
        try:
            logging.info(f"Tentando criar ordem: client_id={client_id}, symbol={symbol}, side={side}, quantity={quantity}")
            response = self.client.place_order(
                category="linear",
                symbol=symbol,
                side=side.capitalize(),  # "Buy" ou "Sell"
                orderType="Market",
                qty=str(quantity)
            )
            if response["retCode"] != 0:
                raise Exception(f"Erro na API: {response['retMsg']} (ErrCode: {response['retCode']})")
            logging.info(f"Sucesso ao criar ordem: {response}")
            return response
        except Exception as e:
            logging.error(f"Erro ao criar ordem: {e}")
            return None

