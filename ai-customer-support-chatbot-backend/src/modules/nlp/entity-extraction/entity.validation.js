const { ENTITY_KEYS } = require("./entity.constants");

class EntityValidation {
  /**
   * Cleans and validates the extracted entity value.
   * @param {string} key - Entity Key
   * @param {any} value - Extracted value
   * @returns {any} Validated value or null if invalid
   */
  validate(key, value) {
    if (value === null || value === undefined || value === "") return null;

    switch (key) {
      case ENTITY_KEYS.EMAIL:
        // Extract email string (useful if embedded in markdown links)
        const emailMatch = String(value).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return emailMatch ? emailMatch[0].toLowerCase() : null;

      case ENTITY_KEYS.HIRING_COUNT:
      case ENTITY_KEYS.EXPERIENCE:
        // Attempt to parse integers
        const num = parseInt(String(value).replace(/[^0-9]/g, ""), 10);
        return isNaN(num) ? String(value).trim() : num;

      case ENTITY_KEYS.SKILLS:
        // Ensure skills are always an array
        if (Array.isArray(value)) return value.map(v => String(v).trim());
        if (typeof value === "string") return value.split(",").map(v => v.trim());
        return null;

      default:
        // Default string trimming
        return typeof value === "string" ? value.trim() : value;
    }
  }
}

module.exports = new EntityValidation();
