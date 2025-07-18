import { useEffect, useState } from 'react';
import { getRealm } from '..';
import { format } from 'date-fns';

type ServiceBreakdown = {
  name: string;
  totalSales: number;
};

type MonthlyTrend = {
  [serviceName: string]: {
    month: string;
    total: number;
  }[];
};

export const useServiceSalesReport = () => {
  const [breakdown, setBreakdown] = useState<ServiceBreakdown[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend>({});

  useEffect(() => {
    const realm = getRealm();

    const transactions = realm.objects('Transaction').filtered("status == 'completed'");

    const serviceMap: Record<string, number> = {};
    const trendMap: Record<string, Record<string, number>> = {};

    transactions.forEach((transaction: any) => {
      const monthKey = format(new Date(transaction.createdAt), 'yyyy-MM');

      transaction.services.forEach((service: any) => {
        // Total Sales per Service
        serviceMap[service.name] = (serviceMap[service.name] || 0) + service.totalPrice;

        // Monthly Trends per Service
        if (!trendMap[service.name]) trendMap[service.name] = {};
        trendMap[service.name][monthKey] = (trendMap[service.name][monthKey] || 0) + service.totalPrice;
      });
    });

    // Format for bar chart
    const breakdownArr = Object.entries(serviceMap).map(([name, totalSales]) => ({
      name,
      totalSales,
    }));

    // Format for line chart
    const monthlyTrendObj: MonthlyTrend = {};
    Object.entries(trendMap).forEach(([name, months]) => {
      monthlyTrendObj[name] = Object.entries(months)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([month, total]) => ({ month, total }));
    });

    setBreakdown(breakdownArr);
    setMonthlyTrends(monthlyTrendObj);
  }, []);

  return { breakdown, monthlyTrends };
};
