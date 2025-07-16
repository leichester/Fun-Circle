// Session debugging utility
export const debugSession = async () => {
  console.log('🔍 === SESSION DEBUG START ===');
  
  // Check localStorage for Supabase session
  const keys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('auth'));
  console.log('🗂️ Storage keys containing auth/supabase:', keys);
  
  keys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`📝 ${key}:`, value ? JSON.parse(value) : value);
    } catch (e) {
      console.log(`📝 ${key}:`, localStorage.getItem(key));
    }
  });
  
  // Check our specific key
  const ourKey = 'fun-circle-auth-token';
  const ourSession = localStorage.getItem(ourKey);
  console.log(`🎯 Our session (${ourKey}):`, ourSession);
  
  console.log('🔍 === SESSION DEBUG END ===');
};
