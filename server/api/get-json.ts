import { readFile } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  const files = ['robberypoints', 'members', 'balance', 'cascolist'];
  const data: { [key: string]: any } = {};

  try {
    for (const file of files) {
      const filePath = join(process.cwd(), 'static/json', `${file}.json`);
      const fileData = await readFile(filePath, 'utf-8');
      data[file] = JSON.parse(fileData);
    }
    return data;
  } catch (error) {
    console.error('Hiba a JSON fájlok beolvasása során:', error);
    throw createError({ statusCode: 500, message: 'Nem sikerült beolvasni a JSON fájlokat' });
  }
});