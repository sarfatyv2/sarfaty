// Script to authenticate and get a JWT token for ZAP DAST scan
async function getAuthToken() {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set');
    // For CI/CD purposes without secrets, return a dummy token to avoid failing the workflow completely
    // ZAP will just scan unauthenticated
    console.log('dummy-token-for-unauthenticated-scan');
    process.exit(0);
  }

  try {
    // Assuming Supabase auth is used based on context, or a standard API login
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.warn(`Authentication failed: ${response.statusText}, falling back to unauthenticated scan`);
      console.log('dummy-token-for-unauthenticated-scan');
      return;
    }

    const data = await response.json();
    
    // Extract token (adjust based on actual response payload structure)
    const token = data.accessToken || data.token || data.session?.access_token;
    
    if (!token) {
      console.warn('Token not found in response, falling back to unauthenticated scan');
      console.log('dummy-token-for-unauthenticated-scan');
      return;
    }

    // Output only the token to stdout
    console.log(token);
  } catch (error) {
    console.error('Error fetching auth token:', error);
    console.log('dummy-token-for-unauthenticated-scan');
  }
}

getAuthToken();
