/** No-op reporter stub — satisfies playwright.config.js reference */
class Sic19Reporter {
  onBegin(_config, _suite) {}
  onTestBegin(_test) {}
  onStepBegin(_test, _result, _step) {}
  onStepEnd(_test, _result, _step) {}
  onTestEnd(_test, _result) {}
  onEnd(_result) {}
  onError(_error) {}
}

module.exports = Sic19Reporter;
