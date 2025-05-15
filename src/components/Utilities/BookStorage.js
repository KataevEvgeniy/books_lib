import Dexie from 'dexie';

// Создание базы данных с использованием Dexie
const db = new Dexie("BookStorageDB");

// Описание структуры базы данных
db.version(1).stores({
    books: '++id, fileType, bookData, file'  // id автоинкремент, другие поля могут быть индексированы
});

// Описание класса книги
class Fb2Data {
    constructor(title,author, currentPage, totalPages, image,lastOpenDate = Date.now()) {
        this.title = title;
        this.author = author;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.image = image;
        this.lastOpenDate = lastOpenDate;
    }
}

// Синглтон для работы с хранилищем книг
class BookStorage {
    static instance;

    constructor() {
        if (BookStorage.instance) {
            return BookStorage.instance;
        }

        this.db = new Dexie("BookStorageDB");
        this.db.version(1).stores({
            books: '++id, fileType, bookData, file'
        });

        BookStorage.instance = this;
    }

    // Метод для добавления книги
    async saveBook(book) {
        try {
            const id = await this.db.books.add(book);
            console.log('Book added with ID:', id);
            return id;
        } catch (error) {
            console.error('Error adding book:', error);
            throw error;
        }
    }

    // Метод для получения всех книг
    async getBooks() {
        try {
            // Извлекаем все книги, но только нужные поля
            const books = await this.db.books.toArray();

            // Возвращаем только метаданные книг (без поля file)
            const booksMetadata = books.map(book => {
                const { id, fileType, metadata } = book; // извлекаем только нужные поля
                return { id, fileType, metadata };
            });

            return booksMetadata;
        } catch (error) {
            console.error('Error retrieving books:', error);
            throw error;
        }
    }

    // Метод для получения книги по ID
    async getBookById(id) {
        try {
            const book = await this.db.books.get(parseInt(id));
            console.log('Book retrieved by ID:', book);
            return book;
        } catch (error) {
            console.error('Error retrieving book by ID:', error);
            throw error;
        }
    }

    // Метод для обновления книги по ID
    async updateBookMetadataField(id, field, newValue) {
        try {
            const book = await this.db.books.get(id);
            if (book) {
                book.metadata[field] = newValue;
                await this.db.books.put(book);
                console.log(`Book ${id} updated successfully`);
            } else {
                console.log(`Book with id ${id} not found`);
            }
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    }

    async deleteBook(id) {
        try {
            await this.db.books.delete(id);
            console.log(`Book with ID ${id} deleted successfully`);
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    }
}

// Экспортируем синглтон BookStorage
const bookStorage = new BookStorage();
export { bookStorage, Fb2Data };
