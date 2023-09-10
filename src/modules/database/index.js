const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath);
        this.initDatabase();
    }

    initDatabase() {
        const createSpecialtyTable = `
            CREATE TABLE IF NOT EXISTS Specialty (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        `;

        this.db.run(createSpecialtyTable);
    }
    getUserByName(chatId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM Users WHERE chat_id = ?', [chatId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    createUser(name, chat_id, phone = '') {
        if (!chat_id) {
            console.error("Chat id is required, skipping creating user");
            return;
        }
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO Users (name, phone, chat_id) VALUES (?, ?, ?)', [name, phone, chat_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    console.log("User was created", { chat_id });
                    resolve(this.lastID);
                }
            });
        });
    }

    getDoctorSpecialties() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM Specialty', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const specialties = rows.map((row) => row.name);
                    resolve(specialties);
                }
            });
        });
    }

    getHospitalsBySpecialty(specialty) {
        console.log("Start getting hospitals by specialty", { specialty });
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM Hospitals WHERE specialties LIKE ?', [`%${specialty}%`], (err, rows) => {
                if (err) {
                    console.log({err})
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getDoctorsBySpecialityAndHospital(specialty, hospitalId) {
        console.log("Start getting doctors by specialty and hospital", { specialty, hospitalId })
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM Doctors WHERE specialty LIKE ? AND hospital_id = ?', [`%${specialty}%`, hospitalId], (err, rows) => {
                if (err) {
                    console.log({err})
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
    });
    }
    close() {
        this.db.close();
    }
}

module.exports = {
    Database
};
