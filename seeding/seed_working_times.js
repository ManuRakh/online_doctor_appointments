const { Database  } = require('../src/modules/database');
const db = new Database("hospital.db");
const sqlite3 = require('sqlite3').verbose();
const directDb = new sqlite3.Database("hospital.db");

const seedWorkingTimes = (startTime, endTime, interval) => {
    const workingTimes = [];
  
    const startHour = parseInt(startTime);
    const endHour = parseInt(endTime);
    const partsCount = Math.floor(60 / interval);
  
    for (let i = startHour; i < endHour; i++) {
      for (let j = 0; j < partsCount; j++) {
        const hour = i.toString().padStart(2, '0');
        const minute = (j * interval).toString().padStart(2, '0');
        const time = `${hour}:${minute}`;
        workingTimes.push(time);
      }
    }
  
    return workingTimes;
  }

  const updateWorkingTimes = async () => {
    const doctors = await db.getAllDoctors();
  
    for(const doctor of doctors) {
      const workingTimes = JSON.stringify(seedWorkingTimes(8, 17, 30)); // 8:00 - 17:00, 30 min interval
      directDb.run(`
        UPDATE Doctors SET working_times = ? WHERE id = ?
      `, [workingTimes, doctor.id]);
    }
  };

  updateWorkingTimes();