// ============================================
// ADDRESS BOOK FINAL VERIFICATION SCRIPT
// ============================================

console.log('🔍 ADDRESS BOOK FINAL VERIFICATION');
console.log('===================================');

// Get user ID
function getUserId() {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.user?.id || parsed.user?.id || null;
    }
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData).id || null;
    }
  } catch (e) {}
  return null;
}

const userId = getUserId();

if (!userId) {
  console.log('❌ No user found. Please login first.');
  console.log('👉 Go to: http://localhost:5173/login');
} else {
  console.log(`✅ User ID: ${userId}`);
  console.log(`✅ Storage Key: addresses_${userId}`);
  
  // Check if addresses exist
  const data = localStorage.getItem(`addresses_${userId}`);
  if (data) {
    const addresses = JSON.parse(data);
    console.log(`✅ Found ${addresses.length} address(es)`);
    console.log('📋 Addresses:', addresses);
  } else {
    console.log('ℹ️ No addresses found. Run: addTestAddress()');
  }
  
  // Check if component is mounted
  const hasComponent = document.querySelector('[class*="AddressBook"]') || 
                       document.querySelector('.space-y-4');
  console.log(hasComponent ? '✅ AddressBook component found' : '❌ AddressBook component not found');
  
  // Check for add button
  const addButton = Array.from(document.querySelectorAll('button')).find(
    btn => btn.textContent.includes('Add New Address')
  );
  console.log(addButton ? '✅ Add button found' : '❌ Add button not found');
}

console.log('\n📝 Available commands:');
console.log('  viewAddresses()           - View all addresses');
console.log('  addTestAddress()          - Add a test address');
console.log('  addMultipleTestAddresses() - Add 3 test addresses');
console.log('  clearAddresses()          - Clear all addresses');
console.log('  verifyAddressBook()       - Run this verification again');

// Make verification function available
window.verifyAddressBook = function() {
  console.log('🔄 Re-running verification...');
  // Reload the script
  const script = document.createElement('script');
  script.src = 'data:text/javascript;base64,' + btoa(`
    console.log('🔍 ADDRESS BOOK FINAL VERIFICATION');
    console.log('===================================');
    const userId = (() => {
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          return parsed.state?.user?.id || parsed.user?.id || null;
        }
        const userData = localStorage.getItem('user');
        if (userData) {
          return JSON.parse(userData).id || null;
        }
      } catch (e) {}
      return null;
    })();
    if (!userId) {
      console.log('❌ No user found. Please login first.');
    } else {
      console.log('✅ User ID:', userId);
      const data = localStorage.getItem('addresses_' + userId);
      if (data) {
        const addresses = JSON.parse(data);
        console.log('✅ Found', addresses.length, 'address(es)');
      } else {
        console.log('ℹ️ No addresses found.');
      }
      const hasComponent = document.querySelector('[class*="AddressBook"]') || document.querySelector('.space-y-4');
      console.log(hasComponent ? '✅ Component found' : '❌ Component not found');
    }
  `);
  document.head.appendChild(script);
};

console.log('\n✅ Verification complete!');
console.log('💡 Type verifyAddressBook() to run again');
