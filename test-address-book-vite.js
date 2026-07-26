// Manual test script for AddressBook component
// Run in browser console at http://localhost:5173/addresses

console.log('🧪 Address Book Test Script (Vite)');
console.log('==================================');

// Test 1: Check if component renders
const addressBook = document.querySelector('[class*="AddressBook"]');
console.log('✅ Test 1: Component renders:', !!addressBook);

// Test 2: Check if add button exists
const addButton = document.querySelector('button');
const hasAddButton = Array.from(document.querySelectorAll('button')).some(
  btn => btn.textContent.includes('Add New Address')
);
console.log('✅ Test 2: Add button exists:', hasAddButton);

// Test 3: Check for address cards
const addressCards = document.querySelectorAll('[class*="p-4 border rounded-lg"]');
console.log('✅ Test 3: Address cards found:', addressCards.length);

// Test 4: Check localStorage
function getUserId() {
  // Try to get user from localStorage
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.user?.id || 'test-user-123';
    }
  } catch (e) {}
  return 'test-user-123';
}

const userId = getUserId();
const savedAddresses = localStorage.getItem(`addresses_${userId}`);
console.log('✅ Test 4: User ID:', userId);
console.log('✅ Test 4: Saved addresses:', savedAddresses ? JSON.parse(savedAddresses) : 'None');

// Test 5: Add test address
function addTestAddress() {
  const userId = getUserId();
  const address = {
    id: Date.now().toString(),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '07700123456',
    addressLine1: '123 Test Street',
    addressLine2: 'Apt 4B',
    city: 'London',
    state: 'Greater London',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom',
    isDefault: true,
    type: 'both',
  };
  
  const existing = JSON.parse(localStorage.getItem(`addresses_${userId}`) || '[]');
  existing.push(address);
  localStorage.setItem(`addresses_${userId}`, JSON.stringify(existing));
  console.log('✅ Added test address:', address);
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Test 6: Clear all addresses
function clearAddresses() {
  const userId = getUserId();
  localStorage.removeItem(`addresses_${userId}`);
  console.log('✅ Cleared all addresses');
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Test 7: View addresses
function viewAddresses() {
  const userId = getUserId();
  const data = localStorage.getItem(`addresses_${userId}`);
  const addresses = data ? JSON.parse(data) : [];
  console.log(`📋 Addresses (${addresses.length}):`, addresses);
  return addresses;
}

// Test 8: Add multiple test addresses
function addMultipleTestAddresses() {
  const userId = getUserId();
  const addresses = [
    {
      id: Date.now().toString(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '07700123456',
      addressLine1: '123 Main Street',
      city: 'London',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom',
      isDefault: false,
      type: 'shipping',
    },
    {
      id: (Date.now() + 1).toString(),
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '07700654321',
      addressLine1: '456 Park Avenue',
      city: 'Manchester',
      postalCode: 'M1 2AB',
      country: 'United Kingdom',
      isDefault: true,
      type: 'both',
    },
    {
      id: (Date.now() + 2).toString(),
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      phone: '07700987654',
      addressLine1: '789 Queen Street',
      city: 'Birmingham',
      postalCode: 'B1 1AA',
      country: 'United Kingdom',
      isDefault: false,
      type: 'billing',
    },
  ];
  
  const existing = JSON.parse(localStorage.getItem(`addresses_${userId}`) || '[]');
  const allAddresses = [...existing, ...addresses];
  localStorage.setItem(`addresses_${userId}`, JSON.stringify(allAddresses));
  console.log(`✅ Added ${addresses.length} test addresses`);
  console.log('🔄 Reloading page...');
  window.location.reload();
}

console.log('\n📝 Available functions:');
console.log('  - viewAddresses()          : View all addresses');
console.log('  - addTestAddress()         : Add a single test address');
console.log('  - addMultipleTestAddresses(): Add 3 test addresses');
console.log('  - clearAddresses()         : Clear all addresses');
console.log('  - getUserId()              : Get current user ID');

// Make functions globally available
window.viewAddresses = viewAddresses;
window.addTestAddress = addTestAddress;
window.addMultipleTestAddresses = addMultipleTestAddresses;
window.clearAddresses = clearAddresses;
window.getUserId = getUserId;

console.log('\n✅ Test script loaded!');
console.log('💡 Tip: Run addTestAddress() to add a test address');
console.log('💡 Tip: Run addMultipleTestAddresses() to add 3 test addresses');
console.log('💡 Tip: Run viewAddresses() to see all addresses');
console.log('💡 Tip: Run clearAddresses() to clear all addresses');
console.log(`\n🌐 URL: http://localhost:5173/addresses`);
