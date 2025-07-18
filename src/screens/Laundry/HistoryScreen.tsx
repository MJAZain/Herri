import React, { useEffect, useState } from 'react';
import {
  SectionList,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { getRealm } from '../../realm';
import { ObjectId } from 'bson';

type TransactionEntry = {
  id: string;
  type: 'earning' | 'expense';
  amount: number;
  date: Date;
};

type SectionData = {
  title: string;
  data: TransactionEntry[];
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const formatMonthYear = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
  }).format(date);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);


const RiwayatTransaksiScreen = () => {
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const realm = await getRealm();

      const earnings = realm.objects('Earning');
      const expenses = realm.objects('Expense');

      const combined: TransactionEntry[] = [];

      earnings.forEach((e: any) => {
        combined.push({
          id: e._id.toHexString(),
          type: 'earning',
          amount: e.amount,
          date: new Date(e.createdAt),
        });
      });

      expenses.forEach((e: any) => {
        combined.push({
          id: e._id.toHexString(),
          type: 'expense',
          amount: e.amount,
          date: new Date(e.date),
        });
      });

      combined.sort((a, b) => b.date.getTime() - a.date.getTime());

      const grouped: { [key: string]: TransactionEntry[] } = {};
      combined.forEach((entry) => {
        const key = formatMonthYear(entry.date);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(entry);
      });

      const sectionData: SectionData[] = Object.keys(grouped).map((title) => ({
        title,
        data: grouped[title],
      }));

      setSections(sectionData);
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
       <View style={styles.header}>
         <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
       </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.label}>
              {item.type === 'earning' ? 'Pemasukan' : 'Pengeluaran'} - {formatDate(item.date)}
            </Text>
            <Text
              style={[
                styles.amount,
                item.type === 'earning' ? styles.earning : styles.expense,
              ]}
            >
              {formatRupiah(item.amount)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noData}>Belum ada transaksi.</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default RiwayatTransaksiScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(251, 247, 238, 1)',
  },
    header: {
    backgroundColor: 'rgba(44, 87, 140, 1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Lexend-Bold'
  },
  sectionHeader: {
    backgroundColor: 'rgba(255, 219, 137, 1)',
    padding: 16,
    fontFamily: 'Lexend-Bold',
    color: 'rgba(5, 49, 105, 1)',
    margin: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 4,
    borderColor: '#eee',
    padding: 16,
    margin: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular'
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold'
  },
  earning: {
    color: '#16a34a',
  },
  expense: {
    color: '#dc2626',
  },
  noData: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
