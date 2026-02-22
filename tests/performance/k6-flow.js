import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  const apiUrl = __ENV.API_URL || 'http://localhost:3000';
  
  // Test healthcheck endpoint as a baseline
  const res = http.get(`${apiUrl}/health`);
  check(res, { 
    'status is 200': (r) => r.status === 200 
  });
}
