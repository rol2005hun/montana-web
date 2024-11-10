<template>
  <main class="container">
    <div class="dashboard">
      <section class="panel balance">
        <h2>Fraki kassza</h2>
        <input v-if="isEditing" type="number" v-model="balance.money" placeholder="Pénzösszeg módosítása" />
        <p v-else>${{ formatMoney(balance.money) }}</p>
        <input v-if="isEditing" type="text" v-model="transactionDescription" placeholder="Add meg a leírást" />
        <h3>Tranzakciók</h3>
        <ul>
          <li v-for="(transaction, index) in balance.transactions.slice().reverse()" :key="transaction.id">
            <p><strong>Dátum:</strong> {{ transaction.date }}</p>
            <p><strong>Előző teljes összeg:</strong> ${{ formatMoney(transaction.previousAmount) }}</p>
            <p><strong>Módosított összeg:</strong> {{ transaction.amount > transaction.previousAmount ? '+' : '' }}${{ formatMoney(transaction.amount - transaction.previousAmount) }}</p>
            <p><strong>Leírás:</strong> 
              <span v-if="!isEditing">{{ transaction.description }}</span>
              <input v-if="isEditing" v-model="transaction.description" placeholder="Add meg a leírást" />
            </p>
            <button v-if="isEditing" @click="removeTransaction(index)">Törlés</button>
          </li>
        </ul>
      </section>

      <section class="panel members">
        <h2>Tagok - {{ members.length }}</h2>
        <ul>
          <li v-for="(member, index) in members.slice().reverse()" :key="member.id">
            <p>
              <strong>Teljes név:</strong>
              <input v-if="isEditing" type="text" v-model="member.fullName" />
              <span v-else>{{ member.fullName }}</span>
            </p>
            <p>
              <strong>Tel. szám:</strong>
              <input v-if="isEditing" type="text" v-model="member.phoneNumber" />
              <span v-else>{{ member.phoneNumber }}</span>
            </p>
            <p>
              <strong>Discord tag:</strong>
              <input v-if="isEditing" type="text" v-model="member.discordTag" />
              <span v-else>{{ member.discordTag }}</span>
            </p>
            <p>
              <strong>Warn lista:</strong>
              <span v-if="!isEditing">{{ member.warnList.length > 0 ? member.warnList : 'Nincs' }}</span>
              <input v-if="isEditing" type="text" v-model="member.warnList" placeholder="Warn lista (vesszővel elválasztva)" />
            </p>
            <p>
              <strong>Csatlakozás dátuma:</strong>
              <input v-if="isEditing" type="date" v-model="member.joinDate" />
              <span v-else>{{ member.joinDate }}</span>
            </p>
            <button v-if="isEditing" @click="removeMember(index)">Eltávolítás</button>
          </li>
        </ul>
        <button v-if="isEditing" @click="addMember">Új tag hozzáadása</button>
      </section>

      <section class="panel passwords">
        <h2>Casco jelszavak</h2>
        <ul>
          <li v-for="(casco, index) in cascolist" :key="casco.id">
            <p>
              <strong>Cég neve:</strong>
              <input v-if="isEditing" type="text" v-model="casco.companyName" />
              <span v-else>{{ casco.companyName }}</span>
            </p>
            <p>
              <strong>Jelszó:</strong>
              <input v-if="isEditing" type="text" v-model="casco.password" />
              <span v-else>{{ casco.password }}</span>
            </p>
            <p>
              <strong>Lejárati dátum:</strong>
              <input v-if="isEditing" type="date" v-model="casco.expirationDate" />
              <span v-else>{{ casco.expirationDate }}</span>
            </p>
            <button v-if="isEditing" @click="removeCasco(index)">Eltávolítás</button>
          </li>
        </ul>
        <button v-if="isEditing" @click="addCasco">Új Casco hozzáadása</button>
      </section>
    </div>

    <div class="auth-panel">
      <input v-if="!isEditing" type="password" v-model="authCode" placeholder="Kód megadása a szerkesztéshez" />
      <button v-if="!isEditing" @click="checkAuth">Ellenőrzés</button>
      <button v-if="isEditing" @click="saveAll">Mentés</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import cascolistData from '@/static/json/cascolist.json';
import membersData from '@/static/json/members.json';
import balanceData from '@/static/json/balance.json';

const authCode = ref('');
const isEditing = ref(false);
const balance = ref(balanceData);
const transactionDescription = ref('Leírás');
const members = ref(membersData);
const cascolist = ref(cascolistData);

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('hu-HU').format(amount);
};

const checkAuth = () => {
  if (authCode.value === 'karcsikaka') {
    isEditing.value = true;
  } else {
    alert('Helytelen kód!');
  }
};

const saveAll = async () => {
  members.value.forEach(member => {
    member.warnList = member.warnList;
  });

  const previousBalance = balance.value.previousMoney;
  const newBalance = balance.value.money;
  balance.value.previousMoney = newBalance;

  if (previousBalance !== newBalance) {
    const difference = newBalance - previousBalance;
    const sign = difference > 0 ? '+' : '';
    const description = transactionDescription.value || `Előző összeg: $${previousBalance}, módosított összeg: ${sign}$${difference}`;
    balance.value.transactions.push({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: balance.value.money,
      previousAmount: previousBalance,
      description: description,
    });
  }

  try {
    const response = await fetch('/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        balance: balance.value,
        members: members.value,
        cascolist: cascolist.value,
      })
    });

    if (!response.ok) {
      alert('Hiba a mentés során! szolj mar sztivnek');
    }

    const data = await response.json();
    isEditing.value = false;
  } catch (error) {
    alert('Hiba a mentés során! szolj mar sztivnek' + error);
  }
};

const removeTransaction = (index: number) => {
  balance.value.transactions.splice(index, 1);
};

const addMember = () => {
  members.value.push({
    id: Date.now(),
    fullName: '',
    phoneNumber: '',
    discordTag: '',
    warnList: '',
    joinDate: '',
  });
};

const removeMember = (index: number) => {
  members.value.splice(index, 1);
};

const addCasco = () => {
  cascolist.value.push({
    id: Date.now(),
    companyName: '',
    password: '',
    expirationDate: '',
  });
};

const removeCasco = (index: number) => {
  cascolist.value.splice(index, 1);
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/index.scss';
</style>