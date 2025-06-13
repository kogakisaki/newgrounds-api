
/**
 * Converts a date string in MM/DD/YY format to an object of day, month, and 4-digit year.
 * Handles the two-digit year by assuming the 21st century (20xx) for years 00-69,
 * and the 20th century (19xx) for years 70-99.
 *
 * @param {string} dateString The date string in "MM/DD/YY" format (e.g., "11/21/22").
 * @returns {{day: number, month: number, year: number} | null} An object with day, month (1-indexed),
 *   and full 4-digit year, or null if the date string is invalid.
 */
function convertMMDDYYToDateObject(dateString: string): object | null {
  const parts = dateString.split('/');

  // 1. Basic format check: Ensure 3 parts
  if (parts.length !== 3) {
    console.error(`Invalid date format "${dateString}". Expected MM/DD/YY.`);
    return null;
  }

  // 2. Parse components to integers
  const month = parseInt(parts[0], 10); // MM
  const day = parseInt(parts[1], 10);   // DD
  let yearYY = parseInt(parts[2], 10);  // YY (e.g., 22)

  // 3. Check for valid numbers
  if (isNaN(month) || isNaN(day) || isNaN(yearYY)) {
    console.error(`Invalid date components in "${dateString}". Month, day, or year are not numbers.`);
    return null;
  }

  // 4. Determine full 4-digit year based on the 2-digit year heuristic
  // Common heuristic: If YY is 00-69, assume 20YY; if YY is 70-99, assume 19YY.
  // This can be adjusted based on your specific application's date range.
  let fullYear;
  if (yearYY >= 0 && yearYY <= 99) { // Ensure it's a 2-digit number for the heuristic
    if (yearYY <= 69) { // e.g., 22 -> 2022
      fullYear = 2000 + yearYY;
    } else { // e.g., 85 -> 1985
      fullYear = 1900 + yearYY;
    }
  } else {
    // This case would apply if input was like '11/21/2022' instead of '11/21/22'
    // For MM/DD/YY specific function, it implies the year must be 2 digits.
    console.error(`Year component "${parts[2]}" is not a 2-digit number as expected for MM/DD/YY.`);
    return null;
  }

  // 5. Robust validation using a temporary Date object
  // JavaScript's Date constructor expects month to be 0-indexed (Jan is 0, Dec is 11)
  const tempDate = new Date(fullYear, month - 1, day);

  // Check if the created date is valid and didn't "roll over" (e.g., Feb 30th becoming March 2nd)
  // Also checks for 'Invalid Date' (e.g., if day/month are wildly out of range)
  if (isNaN(tempDate.getTime()) ||       // Checks if it's an "Invalid Date" object
      tempDate.getFullYear() !== fullYear ||
      tempDate.getMonth() !== (month - 1) || // Compare with 0-indexed input month
      tempDate.getDate() !== day) {
    console.error(`Invalid date "${dateString}". Day or month is out of range for the given year.`);
    return null;
  }

  // 6. Return the structured object
  return {
    day: day,
    month: month, // Return month as 1-indexed (as it was in the input string)
    year: fullYear
  };
}

function convertTimeFormatToSeconds(timeString: string) {
  let totalSeconds = 0;
  const mmssMatch = timeString.match(/^(\d+):(\d+)$/);
  if (mmssMatch) {
    const minutes = parseInt(mmssMatch[1], 10);
    const seconds = parseInt(mmssMatch[2], 10);
    if (seconds >= 0 && seconds < 60) {
      totalSeconds = minutes * 60 + seconds;
      return totalSeconds;
    } else {
      console.warn("Invalid seconds in mm:ss format:", timeString);
      return null;
    }
  }

  const minMatch = timeString.match(/(\d+)\s*(?:min|m)/i);
  if (minMatch) {
    const minutes = parseInt(minMatch[1], 10);
    totalSeconds += minutes * 60;
  }


  const secMatch = timeString.match(/(\d+)\s*(?:sec|s)/i);
  if (secMatch) {
    const seconds = parseInt(secMatch[1], 10);
    totalSeconds += seconds;
  }


  if (!mmssMatch && !minMatch && !secMatch) {
    console.warn("Invalid time string format:", timeString);
    return null;
  }
  return totalSeconds;
}

function convertHtmlToMarkdown(htmlString: string): string {
  let markdown = htmlString;

  // Block-level elements
  markdown = markdown.replace(/<p>(.*?)<\/p>/gis, '\n$1\n');
  markdown = markdown.replace(/<dl>|<\/dl>/gi, '\n'); // Combined dl tags
  markdown = markdown.replace(/<dt>(.*?)<\/dt>/gis, '* **$1**\n');
  markdown = markdown.replace(/<dd[^>]*?>(.*?)<\/dd>/gis, '  $1\n');
  markdown = markdown.replace(/<ul[^>]*?>|<\/ul>/gi, '\n'); // Combined ul tags
  markdown = markdown.replace(/<li[^>]*?>(.*?)<\/li>/gis, '* $1\n');

  // New rule for <br> tags
  // Replaces <br>, <br/>, <br /> with two spaces and a newline (Markdown's hard break)
  markdown = markdown.replace(/<br\s*\/?>/gi, '  \n');

  // Inline elements
  markdown = markdown.replace(/<a[^>]*?href="(.*?)"[^>]*?>(.*?)<\/a>/gis, '[$2]($1)');
  markdown = markdown.replace(/<sup>\*<\/sup>/gi, '*');
  markdown = markdown.replace(/<sup>(.*?)<\/sup>/gis, '<sup>$1</sup>');

  // Cleanup
  markdown = markdown.replace(/^\s*\n/gm, '\n'); // Remove empty lines at the start
  markdown = markdown.replace(/\n\s*$/gm, '\n'); // Remove empty lines at the end
  markdown = markdown.trim(); // Trim leading/trailing whitespace
  markdown = markdown.replace(/\n\n+/g, '\n\n'); // Collapse multiple newlines into two

  return markdown;
}

export {
  convertMMDDYYToDateObject,
  convertTimeFormatToSeconds,
  convertHtmlToMarkdown
}