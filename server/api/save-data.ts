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

    return { message: 'Adatok sikeresen elmentve' };
  } catch (error) {
    return { error: 'Hiba történt az adatok mentésekor', details: (error as Error).message };
  }
});
