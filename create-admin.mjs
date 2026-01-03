import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'job_application_system'
  });

  const hashedPassword = await bcrypt.hash('78592121', 10);
  
  try {
    await connection.execute(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE password = ?, role = ?',
      ['Link Admin', 'link@admin.com', hashedPassword, 'admin', hashedPassword, 'admin']
    );
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email: link@admin.com');
    console.log('Senha: 78592121');
    console.log('Role: admin');
  } catch (error) {
    console.error('Erro:', error.message);
  }
  
  await connection.end();
}

createAdmin();
