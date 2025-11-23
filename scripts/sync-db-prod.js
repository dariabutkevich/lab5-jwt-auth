const db = require("../app/models");
const Role = db.role;

async function runSync() {
    try {
        console.log("Starting Production DB Synchronization (creating tables if they do not exist)...");
        
        // Используем { alter: true } или { force: false } 
        // Force: true удалит все данные! НЕ используйте его в Production
        await db.sequelize.sync({ alter: true }); 
        
        console.log("DB Sync complete. Checking roles...");

        // Инициализация ролей (повторно используем вашу функцию, но убедимся, что она безопасна)
        await initial(); 

        console.log("Post-deploy setup successful.");
        process.exit(0); // Успешное завершение
        
    } catch (err) {
        console.error("FATAL: Production DB sync failed:", err.message);
        process.exit(1); // Завершение с ошибкой, если что-то пошло не так
    }
}

// Функцию initial() нужно скопировать из server.js
async function initial() {
    try {
        const count = await Role.count();
        if (count === 0) {
            await Role.bulkCreate([
                { id: 1, name: "user" },
                { id: 2, name: "admin" }
            ]);
            console.log('Roles created: user and admin.');
        } else {
            console.log('Roles already exist.');
        }
    } catch (err) {
        console.error('Error creating roles:', err.message);
    }
}

runSync();