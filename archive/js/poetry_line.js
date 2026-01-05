async function getRandomPoetryLine() {
  try {
    const response = await fetch('https://poetrydb.org/random');
    const data = await response.json();

    if (data && data.length > 0) {
      const poem = data[0];
      const lines = poem.lines;

      // Filter out empty lines
      const nonEmptyLines = lines.filter(line => line.trim() !== "");

      if (nonEmptyLines.length > 0) {
        const randomIndex = Math.floor(Math.random() * nonEmptyLines.length);
        return nonEmptyLines[randomIndex];
      } else {
        return "No lines found in the poem.";
      }
    } else {
      return "Could not retrieve a poem.";
    }
  } catch (error) {
    console.error("Error fetching poetry:", error);
    return "Error retrieving poetry.";
  }
}

// Example usage (for testing in the console):
// getRandomPoetryLine().then(line => console.log(line));
