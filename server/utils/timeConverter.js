/**
 * Converts time duration from HH:MM format to decimal hours
 * 
 * Examples:
 *   "00:30" => 0.5  (30 minutes)
 *   "01:00" => 1.0  (1 hour)
 *   "01:30" => 1.5  (1 hour 30 minutes)
 *   "02:15" => 2.25 (2 hours 15 minutes)
 *   "00:00" => 0.0  (zero hours)
 *   "" => 0.0       (empty defaults to zero)
 * 
 * @param {string|number} timeString - Time in HH:MM format or decimal hours
 * @returns {number} Decimal hours (e.g., 1.5 for 1 hour 30 minutes)
 */
export const timeStringToDecimalHours = (timeString) => {
  // Handle empty, null, or undefined input
  if (!timeString) {
    return 0;
  }

  // If already a number (decimal hours), return as-is
  if (typeof timeString === 'number') {
    return Math.max(0, timeString); // Ensure non-negative
  }

  const trimmed = String(timeString).trim();
  
  // Handle empty string after trim
  if (trimmed === '' || trimmed === '00:00') {
    return 0;
  }

  // Split on colon
  const parts = trimmed.split(':');
  if (parts.length !== 2) {
    console.warn(`Invalid time format: "${timeString}". Expected HH:MM format.`);
    return 0;
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  // Validate parsed values
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes >= 60) {
    console.warn(`Invalid time values in "${timeString}". Hours: ${hours}, Minutes: ${minutes}`);
    return 0;
  }

  const decimalHours = hours + minutes / 60;
  return Math.round(decimalHours * 10000) / 10000; // Round to 4 decimal places to avoid floating-point errors
};

/**
 * Converts decimal hours to HH:MM format
 * Example: 1.5 => "01:30"
 */
export const decimalHoursToTimeString = (decimalHours) => {
  if (typeof decimalHours !== 'number' || decimalHours < 0) {
    return '00:00';
  }

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
