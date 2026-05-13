'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, CreditCard, Truck, Shield, PartyPopper, ArrowRight, Lock } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

type CheckoutStep = 'summary' | 'processing' | 'success';

export function CheckoutModal() {
  const { isCheckoutOpen, setCheckoutOpen, cart, clearCart } = useStore();
  const [step, setStep] = useState<CheckoutStep>('summary');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 200 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleClose = () => {
    if (step === 'success') {
      clearCart();
    }
    setStep('summary');
    setCheckoutOpen(false);
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step !== 'processing' ? handleClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] z-[60] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            {step !== 'processing' && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            <AnimatePresence mode="wait">
              {/* Summary Step */}
              {step === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-5"
                >
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Summary</h2>
                    <p className="text-xs text-gray-400 mt-1">Review your order before checkout</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                          <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Shipping</span>
                      <span className={cn("tabular-nums", shipping === 0 && "text-emerald-500 font-medium")}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Tax (8%)</span>
                      <span className="tabular-nums">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span>Total</span>
                      <span className="tabular-nums">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center gap-4 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure</span>
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Fast Delivery</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 30-Day Returns</span>
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow"
                  >
                    <CreditCard className="w-4 h-4" />
                    Place Order — ${total.toFixed(2)}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* Processing Step */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 flex flex-col items-center justify-center space-y-6"
                >
                  {/* Animated spinner */}
                  <div className="relative w-20 h-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800 border-t-violet-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-violet-500" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Processing your order...</h3>
                    <p className="text-xs text-gray-400">This will only take a moment</p>
                  </div>
                </motion.div>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-10 flex flex-col items-center justify-center space-y-6"
                >
                  {/* Confetti ring */}
                  <div className="relative">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full border-2 border-emerald-400"
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                      className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                    >
                      <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </motion.div>
                  </div>

                  <div className="text-center space-y-2">
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-center"
                    >
                      Order Confirmed! <PartyPopper className="w-5 h-5 text-amber-500" />
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-gray-400 max-w-xs"
                    >
                      Your headphones are on the way! You&apos;ll receive a confirmation email shortly.
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 w-full text-center space-y-1"
                  >
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider">Order Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">${total.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">Order #SNC-{Math.floor(Math.random() * 90000) + 10000}</p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full py-3 rounded-2xl bg-gray-900 dark:bg-violet-600 text-white text-sm font-semibold shadow-lg hover:bg-gray-800 dark:hover:bg-violet-500 transition-colors"
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
