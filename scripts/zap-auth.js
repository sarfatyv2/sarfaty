// Script to authenticate and get a JWT token for ZAP DAST scan
async function getAuthToken() {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set');
    process.exit(1);
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      console.error(`Authentication failed: ${response.status} ${response.statusText} - ${errorPayload}`);
      process.exit(1);
    }

    const data = await response.json();

    const token =
      data?.data?.accessToken ??
      data?.accessToken ??
      data?.token ??
      data?.session?.access_token;

    if (!token) {
      console.error('Token not found in login response');
      process.exit(1);
    }

    console.log(token);
  } catch (error) {
    console.error('Error fetching auth token:', error);
    process.exit(1);
  }
}

getAuthToken();
