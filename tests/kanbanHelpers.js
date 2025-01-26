// tests/kanbanHelpers.js
const { expect } = require('@playwright/test');

// Function to select a card with incomplete subtasks
async function selectCardWithIncompleteSubtasks(page) {
  await page.goto('https://kanban-566d8.firebaseapp.com/');
  await page.waitForSelector('section[data-dragscroll]'); // Wait for the Kanban board to load

  const columns = await page.$$('section[data-dragscroll]'); // Get all columns
  let cardToEdit;
  let completed, total;

  
  // Iterate through columns (starting from the second column)
  for (let i = 1; i < columns.length; i++) {
    const column = columns[i];
    const cards = await column.$$('article'); // Get all cards in the column

    // Iterate through cards to find one with incomplete subtasks
    for (const card of cards) {
      const subtaskText = await card.$eval('p', el => el.textContent.trim()); // Get subtask text
      [completed, total] = subtaskText.match(/\d+/g); // Extract numbers from "X of Y subtasks"

      if (completed < total) { // If there are incomplete subtasks
        cardToEdit = card;
        break;
      }
    }
    if (cardToEdit) break;
  }

  // Throw an error if no card with incomplete subtasks is found
  if (!cardToEdit) {
    throw new Error('No card with incomplete subtasks found outside the first column.');
  }

  return { cardToEdit, completed, total };
}

// Function to complete a subtask
async function completeSubtask(page, cardToEdit) {
  await cardToEdit.click(); // Open the card

  // Find and click the subtask checkbox
  const subtaskElement = await page.$("//div[@class='h-4 w-4 rounded-sm flex items-center justify-center absolute top-1/2 left-1/2 translate-y-[-50%] translate-x-[-50%] bg-white border border-medium-grey border-opacity-25, dark:bg-dark-grey dark:border-opacity-25']");
  await subtaskElement.click(); // Mark the subtask as completed
}

// Function to move the task to the first column
async function moveTaskToFirstColumn(page) {
  // Click the dropdown to select the first column
  await page.click('div.text-sm.text-black.dark\\:text-white.font-bold.rounded.px-4.py-3.relative.w-full.flex.items-center.border.border-medium-grey.border-opacity-25.cursor-pointer.hover\\:border-main-purple.focus\\:border-main-purple.group');
  await page.click('div.p-4.text-medium-grey.hover\\:text-black.dark\\:hover\\:text-white:first-of-type'); // Select the first column
}

// Function to close the card edit page
async function closeCardEditPage(page) {
  await page.mouse.click(10, 10); // Click outside the task box to close the edit page
}

// Export the functions
module.exports = {
  selectCardWithIncompleteSubtasks,
  completeSubtask,
  moveTaskToFirstColumn,
  closeCardEditPage,
};