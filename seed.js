const sqlite3 = require('sqlite3').verbose();
const dbFilePath = 'hospital.db';
const db = new sqlite3.Database(dbFilePath);

const seedScript = `
    CREATE TABLE IF NOT EXISTS Specialty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    INSERT INTO Specialty (name) VALUES
        ('Хирург'),
        ('Терапевт'),
        ('Окулист'),
        ('Стоматолог'),
        ('Педиатр'),
        ('Гинеколог'),
        ('Невролог'),
        ('Ортопед'),
        ('Дерматолог'),
        ('Уролог');
`;

db.serialize(() => {
    db.exec(seedScript, (err) => {
        if (err) {
            console.error('Ошибка выполнения SQL-скрипта:', err.message);
        } else {
            console.log('Сидирование успешно завершено.');
        }

        db.close((err) => {
            if (err) {
                console.error('Ошибка закрытия базы данных:', err.message);
            }
        });
    });
});
