// Utility to clear potentially corrupted auth data
export const clearAuthStorage = () => {
  console.log('🧹 Clearing potentially corrupted auth storage...');
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Find all auth-related keys
  const authKeys = keys.filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('fun-circle-auth') ||
    key.includes('sb-') // Supabase default prefix
  );
  
  console.log('🗑️ Found auth keys to clear:', authKeys);
  
  // Clear them
  authKeys.forEach(key => {
    console.log(`🗑️ Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  console.log('✅ Auth storage cleared');
};
