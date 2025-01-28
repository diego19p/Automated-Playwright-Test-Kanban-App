// tests/editKanbanCard.test.js
const { test, expect } = require('@playwright/test');
const KanbanPage = require('../pages/KanbanPage');

test.describe('Kanban Card Tests', () => {
  let kanbanPage;
  let cardToEdit;
  let completed;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    kanbanPage = new KanbanPage(page);
    await kanbanPage.navigate();

    // Seleccionar una tarjeta con subtareas incompletas antes de ejecutar los tests
    const cardData = await kanbanPage.selectCardWithIncompleteSubtasks();
    cardToEdit = cardData.cardToEdit;
    completed = cardData.completed;
  });

  test.afterAll(async () => {
    // Cerrar la página después de todos los tests
    await kanbanPage.page.close();
  });

  test('Verify subtask is striked through', async () => {
    await kanbanPage.completeSubtask(cardToEdit);

    // Verificar que la subtarea se tachó
    const subtaskSpan = await kanbanPage.getStrikedThroughSubtask();
    expect(subtaskSpan).toBeTruthy();

    const subtaskSpanStyle = await subtaskSpan.evaluate((el) => window.getComputedStyle(el).textDecoration);
    expect(subtaskSpanStyle).toContain('line-through');
  });

  test('Verify number of completed subtasks', async () => {
    // Verificar que el número de subtareas completadas aumentó en 1
    const updatedSubtaskText = await kanbanPage.getSubtaskText(cardToEdit);
    const [updatedCompleted] = updatedSubtaskText.match(/\d+/g);
    expect(parseInt(updatedCompleted)).toBe(parseInt(completed) + 1);
  });

  test('Verify card moved to the first column', async () => {
    await kanbanPage.moveTaskToFirstColumn();
    await kanbanPage.closeCardEditPage();

    // Verificar que la tarjeta está en la primera columna
    const cardsInFirstColumn = await kanbanPage.getFirstColumnCards();
    const originalCardId = await kanbanPage.getCardId(cardToEdit);
    const isCardInFirstColumn = await Promise.any(cardsInFirstColumn.map(async (card) => {
      const cardId = await kanbanPage.getCardId(card);
      return cardId === originalCardId;
    }));

    expect(isCardInFirstColumn).toBeTruthy();
  });
});