import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE } from '@/constants';

interface BillChartsProps {
  data: number[];
  labels: string[];
  title: string;
  color?: string;
}

export const ExpenseTrendChart = ({ data, labels, title, color = COLORS.primary }: BillChartsProps) => {
  const windowWidth = Dimensions.get('window').width - (SPACING.md * 4);

  return (
    <View style={{ marginVertical: SPACING.md }}>
      <Text style={{ fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.sm, color: COLORS.textPrimary }}>
        {title}
      </Text>
      <BarChart
        data={{
          labels: labels,
          datasets: [{ data: data }]
        }}
        width={windowWidth}
        height={220}
        yAxisLabel="Rs."
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          labelColor: (opacity = 1) => COLORS.textSecondary,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: color
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
        verticalLabelRotation={30}
      />
    </View>
  );
};
