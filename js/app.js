// Formatter Class for Tasks
class TaskFormatter {
  shortenText(text) {
      return text.length > 14 ? text.slice(0, 14) + "..." : text;
  }

  formatDeadline(date) {
      return date || "No deadline";
  }

  formatState(state) {
      return state ? "Done" : "Pending";
  }
}

// Core Task Handler
class TaskHandler {
  constructor(formatter) {
      this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      this.formatter = formatter;
  }

  addTask(text, deadline) {
      const task = {
          id: this.generateId(),
          text: this.formatter.shortenText(text),
          deadline: this.formatter.formatDeadline(deadline),
          done: false
      };
      this.tasks.push(task);
      this.saveData();
      return task;
  }

  modifyTask(id, updatedText) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
          task.text = updatedText;
          this.saveData();
      }
      return task;
  }

  removeTask(id) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.saveData();
  }

  switchTaskState(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
          task.done = !task.done;
          this.saveData();
      }
  }

  removeAllTasks() {
      this.tasks = [];
      this.saveData();
  }

  filterTasks(state) {
      return state === "all" ? this.tasks :
             state === "pending" ? this.tasks.filter((t) => !t.done) :
             this.tasks.filter((t) => t.done);
  }

  generateId() {
      return Math.random().toString(36).substr(2, 10);
  }

  saveData() {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }
}

// UI Controller
class UIController {
  constructor(handler, formatter) {
      this.handler = handler;
      this.formatter = formatter;
      this.input = document.querySelector("input");
      this.dateInput = document.querySelector(".date-selector");
      this.addBtn = document.querySelector(".add-btn");
      this.taskTable = document.querySelector(".task-list");
      this.messageBox = document.querySelector(".message-box");
      this.clearBtn = document.querySelector(".clear-btn");

      this.addEventListeners();
      this.renderTasks();
  }

  addEventListeners() {
      this.addBtn.addEventListener("click", () => this.handleNewTask());
      this.clearBtn.addEventListener("click", () => this.clearAllTasks());
  }

  handleNewTask() {
      const text = this.input.value;
      const deadline = this.dateInput.value;
      if (!text.trim()) {
          this.displayMessage("Enter a valid task!", "error");
          return;
      }
      this.handler.addTask(text, deadline);
      this.renderTasks();
      this.input.value = "";
      this.dateInput.value = "";
  }

  renderTasks() {
      const tasks = this.handler.filterTasks("all");
      this.taskTable.innerHTML = tasks.length === 0 ? `<tr><td colspan="4" class="text-center">No tasks yet</td></tr>` : "";

      tasks.forEach((task) => {
          this.taskTable.innerHTML += `
              <tr data-id="${task.id}">
                  <td>${this.formatter.shortenText(task.text)}</td>
                  <td>${this.formatter.formatDeadline(task.deadline)}</td>
                  <td>${this.formatter.formatState(task.done)}</td>
                  <td>
                      <button class="btn btn-warning btn-sm" onclick="uiController.editTask('${task.id}')">
                          <i class="bx bx-edit"></i>
                      </button>
                      <button class="btn btn-success btn-sm" onclick="uiController.toggleTask('${task.id}')">
                          <i class="bx bx-check"></i>
                      </button>
                      <button class="btn btn-error btn-sm" onclick="uiController.deleteTask('${task.id}')">
                          <i class="bx bx-trash"></i>
                      </button>
                  </td>
              </tr>
          `;
      });
  }

  editTask(id) {
      const task = this.handler.tasks.find((t) => t.id === id);
      if (task) {
          this.input.value = task.text;
          this.handler.removeTask(id);
          this.renderTasks();
      }
  }

  toggleTask(id) {
      this.handler.switchTaskState(id);
      this.renderTasks();
  }

  deleteTask(id) {
      this.handler.removeTask(id);
      this.renderTasks();
  }

  clearAllTasks() {
      this.handler.removeAllTasks();
      this.renderTasks();
  }

  displayMessage(msg, type) {
      this.messageBox.innerHTML = `<div class="alert alert-${type} shadow-lg">${msg}</div>`;
      setTimeout(() => (this.messageBox.innerHTML = ""), 3000);
  }
}

// Initialize App
const formatter = new TaskFormatter();
const taskHandler = new TaskHandler(formatter);
const uiController = new UIController(taskHandler, formatter);
