const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('hospital.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY,
            name TEXT,
            phone TEXT,
            additional_info TEXT,
            chat_id TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Hospitals (
            id INTEGER PRIMARY KEY,
            name TEXT,
            address TEXT,
            city TEXT,
            specialties TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Doctors (
            id INTEGER PRIMARY KEY,
            name TEXT,
            specialty TEXT,
            hospital_id INTEGER,
            FOREIGN KEY (hospital_id) REFERENCES Hospitals (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Appointments (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            doctor_id INTEGER,
            date_time DATETIME,
            status TEXT,
            FOREIGN KEY (user_id) REFERENCES Users (id),
            FOREIGN KEY (doctor_id) REFERENCES Doctors (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Payments (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            amount REAL,
            date_time DATETIME,
            FOREIGN KEY (user_id) REFERENCES Users (id)
        )
    `);
});

db.close();
