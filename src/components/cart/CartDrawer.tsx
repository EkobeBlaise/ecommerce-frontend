// src/components/cart/CartDrawer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore();
  
  const subtotal = getSubtotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Your Cart</h2>
                <span className="text-gray-500">({getTotalItems()} items)</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-4">Looks like you haven't added any items yet</p>
                  <Link
                    to="/products"
                    onClick={onClose}
                    className="btn-primary"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary-600">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </Link>
                
                <button
                  onClick={onClose}
                  className="w-full text-center text-gray-600 hover:text-gray-800"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Cart Item Component
interface CartItemProps {
  item: any;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex space-x-4 py-4 border-b">
      <img
        src={item.image || 'https://via.placeholder.com/80'}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
        <p className="text-primary-600 font-bold mt-1">${item.price.toFixed(2)}</p>
        
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};