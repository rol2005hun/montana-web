import fs from 'fs';
import path from 'path';

const FILE_PATH_BALANCE = path.resolve('static/json/balance.json');
const FILE_PATH_MEMBERS = path.resolve('static/json/members.json');
const FILE_PATH_CASCO = path.resolve('static/json/cascolist.json');

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    fs.writeFileSync(FILE_PATH_BALANCE, JSON.stringify(body.balance, null, 2));
    fs.writeFileSync(FILE_PATH_MEMBERS, JSON.stringify(body.members, null, 2));
    fs.writeFileSync(FILE_PATH_CASCO, JSON.stringify(body.cascolist, null, 2));

    // Clear require cache
    delete require.cache[require.resolve(FILE_PATH_BALANCE)];
    delete require.cache[require.resolve(FILE_PATH_MEMBERS)];
    delete require.cache[require.resolve(FILE_PATH_CASCO)];

    // Re-read the files
    const updatedBalance = JSON.parse(fs.readFileSync(FILE_PATH_BALANCE, 'utf-8'));
    const updatedMembers = JSON.parse(fs.readFileSync(FILE_PATH_MEMBERS, 'utf-8'));
    const updatedCasco = JSON.parse(fs.readFileSync(FILE_PATH_CASCO, 'utf-8'));

    return { 
      message: 'Adatok sikeresen elmentve', 
      updatedBalance, 
      updatedMembers, 
      updatedCasco 
    };
  } catch (error) {
    return { error: 'Hiba történt az adatok mentésekor', details: (error as Error).message };
  }
});
