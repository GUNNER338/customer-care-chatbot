class LeadValidation {
  constructor() {
    this.emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Basic phone validation for international formats
    this.phoneRegex = /^(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  }

  isEmailValid(email) {
    if (!email) return false;
    // Extract actual email if it's in a markdown link like [abc@gmail.com](mailto:abc@gmail.com)
    let cleanEmail = email;
    const match = email.match(this.emailRegex);
    if (match) cleanEmail = match[0];
    else {
      // Try to find raw email inside string
      const rawMatch = String(email).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (rawMatch) cleanEmail = rawMatch[0];
      else return false;
    }
    return this.emailRegex.test(cleanEmail);
  }

  isPhoneValid(phone) {
    if (!phone) return false;
    return this.phoneRegex.test(phone.trim());
  }

  isLeadQualified(entities) {
    const hasCompanyName = !!entities.companyName;
    const hasContactPerson = !!entities.name;
    const hasEmailOrPhone = !!entities.email || !!entities.phone;

    return hasCompanyName && hasContactPerson && hasEmailOrPhone;
  }
  
  getMissingRequiredFields(entities) {
    const missing = [];
    if (!entities.companyName) missing.push("companyName");
    if (!entities.name) missing.push("name");
    if (!entities.email && !entities.phone) {
      missing.push("email");
    }
    return missing;
  }
}

module.exports = new LeadValidation();
