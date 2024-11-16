const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "save-books";
const STORAGE_KEY = "BOOKSHELF_APP";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById("incompleteBookList");
    incompleteBookshelfList.innerHTML = "";

    const completeBookshelfList = document.getElementById("completeBookList");
    completeBookshelfList.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isComplete) {
        incompleteBookshelfList.append(bookElement);
      } else {
        completeBookshelfList.append(bookElement);
      }
    }
  });

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });
});

function addBook() {
  const bookTitle = document.getElementById("bookFormTitle").value;
  const bookAuthor = document.getElementById("bookFormAuthor").value;
  const bookYear = parseInt(document.getElementById("bookFormYear").value);
  const bookIsComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;
  textTitle.setAttribute("data-testid", "bookItemTitle");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;
  textAuthor.setAttribute("data-testid", "bookItemAuthor");

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;
  textYear.setAttribute("data-testid", "bookItemYear");

  const container = document.createElement("div");
  container.classList.add("book-item");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");
  container.append(textTitle, textAuthor, textYear);

  const buttonContainer = document.createElement("div");

  if (bookObject.isComplete) {
    const uncompleteButton = document.createElement("button");
    uncompleteButton.innerText = "Belum selesai dibaca";
    uncompleteButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    uncompleteButton.addEventListener("click", function () {
      undoBookFromComplete(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit Buku";
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.addEventListener("click", function () {
      editBook(container, bookObject);
    });

    buttonContainer.append(uncompleteButton, deleteButton, editButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.innerText = "Selesai dibaca";
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.addEventListener("click", function () {
      addBookToComplete(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit Buku";
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.addEventListener("click", function () {
      editBook(container, bookObject);
    });

    buttonContainer.append(completeButton, deleteButton, editButton);
  }

  container.append(buttonContainer);
  return container;
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;
  books.splice(bookTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(container, bookObject) {
  const newBookTitle = document.createElement("input");
  newBookTitle.type = "text";
  newBookTitle.value = bookObject.title;

  const newBookAuthor = document.createElement("input");
  newBookAuthor.type = "text";
  newBookAuthor.value = bookObject.author;

  const newBookYear = document.createElement("input");
  newBookYear.type = "number";
  newBookYear.value = bookObject.year;

  const saveButton = document.createElement("button");
  saveButton.innerText = "Simpan";
  saveButton.addEventListener("click", function () {
    bookObject.title = newBookTitle.value;
    bookObject.author = newBookAuthor.value;
    bookObject.year = newBookYear.value;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });

  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Batal";
  cancelButton.addEventListener("click", function () {
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  container.innerHTML = "";
  container.append(newBookTitle, newBookAuthor, newBookYear, saveButton, cancelButton);
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push({
        ...book,
        year: Number(book.year),
      });
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
