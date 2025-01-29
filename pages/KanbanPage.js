// pages/KanbanPage.js
const { expect } = require('@playwright/test');

class KanbanPage {
  constructor(page) {
    this.page = page;

    // Declarar los Locators aquí
    this.boardColumns = 'section[data-dragscroll]';
    this.cardSelector = "article[class='group flex flex-col bg-white dark:bg-dark-grey p-4 rounded-lg cursor-pointer shadow-task max-w-[280px]']";
    this.subtaskText = "p[class='text-xs text-medium-grey font-bold select-none']";
    this.subtaskCheckbox = "//div[@class='h-4 w-4 rounded-sm flex items-center justify-center absolute top-1/2 left-1/2 translate-y-[-50%] translate-x-[-50%] bg-white border border-medium-grey border-opacity-25, dark:bg-dark-grey dark:border-opacity-25']";
    this.columnDropdown = "//div[@class='text-sm text-black dark:text-white font-bold rounded px-4 py-3 relative w-full flex items-center border border-medium-grey border-opacity-25 cursor-pointer hover:border-main-purple focus:border-main-purple group']";
    this.firstColumnOption = 'div.p-4.text-medium-grey.hover\\:text-black.dark\\:hover\\:text-white:first-of-type';
    this.strikedThroughSubtask = 'span.text-black.dark\\:text-white.text-xs.font-bold.line-through.text-opacity-50.dark\\:text-opacity-50';
  }

  async navigate() {
    await this.page.goto('https://kanban-566d8.firebaseapp.com/');
    await this.page.waitForSelector(this.boardColumns);
  }

  async selectCardWithIncompleteSubtasks() {
    const columns = await this.page.$$(this.boardColumns);
    let cardToEdit;
    let completed, total;

    for (let i = 1; i < columns.length; i++) {
      const column = columns[i];
      const cards = await column.$$(this.cardSelector);

      for (const card of cards) {
        const subtaskText = await card.$eval(this.subtaskText, el => el.textContent.trim());
        [completed, total] = subtaskText.match(/\d+/g);

        if (completed < total) {
          cardToEdit = card;
          break;
        }
      }
      if (cardToEdit) break;
    }

    if (!cardToEdit) {
      throw new Error('No card with incomplete subtasks found outside the first column.');
    }

    return { cardToEdit, completed, total };
  }

  async completeSubtask(cardToEdit) {
    await cardToEdit.click();
    const subtaskElement = await this.page.$(this.subtaskCheckbox);
    await subtaskElement.click();
  }

  async moveTaskToFirstColumn() {
    await this.page.click(this.columnDropdown);
    await this.page.click(this.firstColumnOption);
  }

  async closeCardEditPage() {
    await this.page.mouse.click(10, 10);
  }

  async getStrikedThroughSubtask() {
    return await this.page.$(this.strikedThroughSubtask);
  }

  async getSubtaskText(cardToEdit) {
    return await cardToEdit.$eval(this.subtaskText, el => el.textContent.trim());
  }

  async getFirstColumnCards() {
    const firstColumn = await this.page.$(`${this.boardColumns}:first-child`);
    return await firstColumn.$$(this.cardSelector);
  }

  async getCardId(card) {
    return await card.getAttribute('data-card-id');
  }
}

module.exports = KanbanPage;