const config = {
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['./customReporter.js'],
  ],
  use: {
    trace: 'on',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  retries: 2,
};

module.exports = config;