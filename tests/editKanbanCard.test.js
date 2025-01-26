// tests/editKanbanCard.test.js
const { test, expect } = require('@playwright/test');
const {
  selectCardWithIncompleteSubtasks,
  completeSubtask,
  moveTaskToFirstColumn,
  closeCardEditPage,
} = require('./kanbanHelpers'); // Import reusable functions

// Test 1: Verify that the subtask is striked through
test('Verify subtask is striked through', async ({ page }) => {
  const { cardToEdit } = await selectCardWithIncompleteSubtasks(page); // Select a card with incomplete subtasks
  await completeSubtask(page, cardToEdit); // Complete a subtask

  // Verify that the subtask is striked through
  const subtaskSpan = await page.$('span.text-black.dark\\:text-white.text-xs.font-bold.line-through.text-opacity-50.dark\\:text-opacity-50');
  expect(subtaskSpan).toBeTruthy(); // Verify that the striked-through span exists

  const subtaskSpanStyle = await subtaskSpan.evaluate((el) => window.getComputedStyle(el).textDecoration);
  expect(subtaskSpanStyle).toContain('line-through'); // Verify that the text is striked through
});

// Test 2: Verify that the number of completed subtasks is correct
test('Verify number of completed subtasks', async ({ page }) => {
  const { cardToEdit, completed } = await selectCardWithIncompleteSubtasks(page); // Select a card with incomplete subtasks
  await completeSubtask(page, cardToEdit); // Complete a subtask

  // Verify that the number of completed subtasks has increased by 1
  const updatedSubtaskText = await cardToEdit.$eval('p', el => el.textContent.trim());
  const [updatedCompleted] = updatedSubtaskText.match(/\d+/g); // Extract numbers from "X of Y subtasks"
  expect(parseInt(updatedCompleted)).toBe(parseInt(completed) + 1);
});

// Test 3: Verify that the card moved to the correct column
test('Verify card moved to the first column', async ({ page }) => {
  const { cardToEdit } = await selectCardWithIncompleteSubtasks(page); // Select a card with incomplete subtasks
  await completeSubtask(page, cardToEdit); // Complete a subtask
  await moveTaskToFirstColumn(page); // Move the task to the first column
  await closeCardEditPage(page); // Close the card edit page

  // Verify that the card is in the first column
  const firstColumn = await page.$('section[data-dragscroll]:first-child'); // Select the first column
  const cardsInFirstColumn = await firstColumn.$$('article'); // Get all cards in the first column

  const originalCardId = await cardToEdit.getAttribute('data-card-id'); // Get the unique identifier of the edited card
  const isCardInFirstColumn = await Promise.any(cardsInFirstColumn.map(async (card) => {
    const cardId = await card.getAttribute('data-card-id'); // Get the identifier of the card
    return cardId === originalCardId; // Compare the identifiers
  }));

  expect(isCardInFirstColumn).toBeTruthy(); // Verify that the card is in the first column
});