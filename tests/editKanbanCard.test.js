// tests/editKanbanCard.test.js
const { test, expect } = require('@playwright/test');
const KanbanPage = require('../pages/KanbanPage');

test('Verify subtask is striked through', async ({ page }) => {
  const kanbanPage = new KanbanPage(page);
  await kanbanPage.navigate();
  const { cardToEdit } = await kanbanPage.selectCardWithIncompleteSubtasks();
  await kanbanPage.completeSubtask(cardToEdit);

  const subtaskSpan = await kanbanPage.getStrikedThroughSubtask();
  expect(subtaskSpan).toBeTruthy();

  const subtaskSpanStyle = await subtaskSpan.evaluate((el) => window.getComputedStyle(el).textDecoration);
  expect(subtaskSpanStyle).toContain('line-through');
});

test('Verify number of completed subtasks', async ({ page }) => {
  const kanbanPage = new KanbanPage(page);
  await kanbanPage.navigate();
  const { cardToEdit, completed } = await kanbanPage.selectCardWithIncompleteSubtasks();
  await kanbanPage.completeSubtask(cardToEdit);

  const updatedSubtaskText = await kanbanPage.getSubtaskText(cardToEdit);
  const [updatedCompleted] = updatedSubtaskText.match(/\d+/g);
  expect(parseInt(updatedCompleted)).toBe(parseInt(completed) + 1);
});

test('Verify card moved to the first column', async ({ page }) => {
  const kanbanPage = new KanbanPage(page);
  await kanbanPage.navigate();
  const { cardToEdit } = await kanbanPage.selectCardWithIncompleteSubtasks();
  await kanbanPage.completeSubtask(cardToEdit);
  await kanbanPage.moveTaskToFirstColumn();
  await kanbanPage.closeCardEditPage();

  const cardsInFirstColumn = await kanbanPage.getFirstColumnCards();
  const originalCardId = await kanbanPage.getCardId(cardToEdit);
  const isCardInFirstColumn = await Promise.any(cardsInFirstColumn.map(async (card) => {
    const cardId = await kanbanPage.getCardId(card);
    return cardId === originalCardId;
  }));

  expect(isCardInFirstColumn).toBeTruthy();
});