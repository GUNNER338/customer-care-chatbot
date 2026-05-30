class CandidateValidation {
  constructor() {
    this.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  }

  validateExperience(exp) {
    if (exp === null || exp === undefined) return null;
    const parsed = parseInt(exp, 10);
    if (isNaN(parsed)) return null;
    if (parsed >= 0 && parsed <= 50) return parsed;
    return null;
  }

  validateEmail(email) {
    if (!email) return null;
    return this.emailRegex.test(email) ? email : null;
  }

  validateUrl(url) {
    if (!url) return null;
    return this.urlRegex.test(url) ? url : null;
  }
}

module.exports = new CandidateValidation();
