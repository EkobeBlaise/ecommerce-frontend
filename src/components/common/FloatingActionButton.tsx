import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronUp, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute bottom-16 right-0 space-y-2"
          >
            <Link to="/cart">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700" />
              </motion.button>
            </Link>
            <Link to="/wishlist">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <Heart className="w-5 h-5 text-gray-700" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={scrollToTop}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
            >
              <ChevronUp className="w-5 h-5 text-gray-700" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};
