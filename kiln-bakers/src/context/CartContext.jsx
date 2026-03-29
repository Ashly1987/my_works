import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

const ACTIONS = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE_QTY: "UPDATE_QTY",
  CLEAR: "CLEAR",
};

function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD: {
      const exists = state.find((i) => i.id === action.product.id);
      if (exists) {
        return state.map((i) =>
          i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...state, { ...action.product, qty: 1 }];
    }
    case ACTIONS.REMOVE:
      return state.filter((i) => i.id !== action.id);
    case ACTIONS.UPDATE_QTY:
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i))
        .filter((i) => i.qty > 0);
    case ACTIONS.CLEAR:
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const addToCart = (product) => dispatch({ type: ACTIONS.ADD, product });
  const removeFromCart = (id) => dispatch({ type: ACTIONS.REMOVE, id });
  const updateQty = (id, qty) =>
    dispatch({ type: ACTIONS.UPDATE_QTY, id, qty });
  const clearCart = () => dispatch({ type: ACTIONS.CLEAR });

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
