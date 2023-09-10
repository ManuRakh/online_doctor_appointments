const sqlite3 = require('sqlite3').verbose();
const dbFilePath = 'hospital.db';

const db = new sqlite3.Database(dbFilePath);

const hospitalsData = [
    {
        name: 'Больница 1',
        address: 'Адрес 1',
        city: 'Город 1',
        specialties: JSON.stringify(['Хирургия', 'Терапия']),
    },
    {
        name: 'Больница 2',
        address: 'Адрес 2',
        city: 'Город 2',
        specialties: JSON.stringify(['Окулистика', 'Педиатрия']),
    },
];

// Данные для сидирования врачей
const doctorsData = [
    {
        name: 'Врач 1',
        specialty: JSON.stringify(['Хирургия']),
        hospitalName: 'Больница 1', // Имя больницы, к которой привязан врач
    },
    {
        name: 'Врач 2',
        specialty: JSON.stringify(['Терапия']),
        hospitalName: 'Больница 1',
    },
    {
        name: 'Врач 3',
        specialty: JSON.stringify(['Окулистика']),
        hospitalName: 'Больница 2',
    },
    {
        name: 'Врач 4',
        specialty: JSON.stringify(['Педиатрия']),
        hospitalName: 'Больница 2',
    },
];

function seedHospitals() {
    hospitalsData.forEach((hospital) => {
        db.run('INSERT INTO Hospitals (name, address, city, specialties) VALUES (?, ?, ?, ?)', [
            hospital.name,
            hospital.address,
            hospital.city,
            hospital.specialties,
        ]);
    });
}

function seedDoctors() {
    let i = 0;
    doctorsData.forEach((doctor) => {
        const hospitalName = doctor.hospitalName;
       
        console.log({i})
                    db.run('INSERT INTO Doctors (name, specialty, hospital_id) VALUES (?, ?, ?)', [
                        doctor.name,
                        doctor.specialty,
                        ++i,
                    ]);
               
    });
}

db.serialize(() => {
    seedHospitals();
    seedDoctors();
});