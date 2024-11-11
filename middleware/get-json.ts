export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const data: { robberypoints?: any[], members?: any[], balance?: any, cascolist?: any[] } = await $fetch('/api/get-json');

    useState('robberyPoints', () => data.robberypoints || []);
    useState('members', () => data.members || []);
    useState('balance', () => data.balance || {});
    useState('cascolist', () => data.cascolist || []);

  } catch (error) {
    console.error('Hiba a JSON fájlok betöltése során:', error);
  }
})