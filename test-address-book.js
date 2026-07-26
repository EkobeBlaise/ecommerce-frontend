// Manual test script for AddressBook component
// Run in browser console at http://localhost:3000/addresses

console.log('🧪 Address Book Test Script');
console.log('===========================');

// Test 1: Check if component renders
const addressBook = document.querySelector('[class*="AddressBook"]');
console.log('✅ Test 1: Component renders:', !!addressBook);

// Test 2: Check if add button exists
const addButton = document.querySelector('button:has-text("Add New Address")');
console.log('✅ Test 2: Add button exists:', !!addButton);

// Test 3: Check localStorage
const userId = 'test-user-123';
const savedAddresses = localStorage.getItem(`addresses_${userId}`);
console.log('✅ Test 3: Saved addresses:', savedAddresses ? JSON.parse(savedAddresses) : 'None');

// Test 4: Add test address
function addTestAddress() {
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
  window.location.reload();
}

// Test 5: Clear all addresses
function clearAddresses() {
  localStorage.removeItem(`addresses_${userId}`);
  console.log('✅ Cleared all addresses');
  window.location.reload();
}

console.log('\n📝 Available functions:');
console.log('  - addTestAddress()  : Add a test address');
console.log('  - clearAddresses()  : Clear all addresses');
console.log('  - viewAddresses()   : View all addresses');

// View addresses function
window.viewAddresses = function() {
  const data = localStorage.getItem(`addresses_${userId}`);
  console.log('📋 Addresses:', data ? JSON.parse(data) : 'None');
};

// Make functions globally available
window.addTestAddress = addTestAddress;
window.clearAddresses = clearAddresses;

console.log('\n✅ Test script loaded!');
console.log('💡 Tip: Run addTestAddress() to add a test address');
console.log('💡 Tip: Run viewAddresses() to see all addresses');
console.log('💡 Tip: Run clearAddresses() to clear all addresses');
