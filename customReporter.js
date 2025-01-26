class CustomReporter {
    constructor(options) {
      this.options = options;
      this.results = [];
    }
  
    onBegin(config, suite) {
      console.log('Starting test run...');
    }
  
    onTestEnd(test, result) {
      const score = result.status === 'passed' ? 10 : 0;
      this.results.push({
        title: test.title,
        status: result.status,
        score: score,
      });
    }
  
    onEnd(result) {
      console.log('Test run finished.');
      console.log('Results with scores:', this.results);
    }
  }
  
  module.exports = CustomReporter;