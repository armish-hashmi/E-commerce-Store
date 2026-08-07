export function clearGuestSession() {
  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  window.dispatchEvent(new Event('storage'));
}