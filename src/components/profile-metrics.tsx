import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

type Props = {
  completion: number;
  delivered: number;
  deliveredSuffix: string;
  shiftLabel: string;
  shiftHours: string;
  loading: boolean;
  error: string | null;
};

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Metric = {
  icon: IconName;
  value: string;
  suffix?: string;
  caption: string;
  valueSmall?: boolean;
};

export function ProfileMetrics({
  completion,
  delivered,
  deliveredSuffix,
  shiftLabel,
  shiftHours,
  loading,
  error,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const unavailable = loading || Boolean(error);
  const metrics: Metric[] = [
    { icon: 'check-decagram', value: unavailable ? '—' : `${completion}%`, caption: 'Conclusão' },
    { icon: 'checkbox-marked-circle-outline', value: unavailable ? '—' : `${delivered}`, suffix: deliveredSuffix, caption: 'Entregues' },
    { icon: 'clock-outline', value: shiftLabel, caption: shiftHours, valueSmall: true },
  ];

  return (
    <View>
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          Desempenho & Escala
        </Text>
        <Text className="text-[11px] font-medium text-[#006A61]">Ciclo Atual</Text>
      </View>

      <View
        className="mt-1 gap-2"
        style={{ flexDirection: 'row', flexWrap: isWide ? 'nowrap' : 'wrap' }}
      >
        {metrics.map((metric) => (
          <View
            key={metric.icon}
            className="rounded-2xl bg-surface-lowest p-3 shadow-sm"
            style={{
              width: isWide ? undefined : '48%',
              flex: isWide ? 1 : undefined,
            }}
          >
            <View className="mb-2 h-7 w-7 items-center justify-center rounded-lg bg-[#0F2042]/10">
              <MaterialCommunityIcons name={metric.icon} size={18} color="#0F2042" />
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text className={`${metric.valueSmall ? 'text-base' : 'text-xl'} font-bold text-on-surface`}>
                {metric.value}
              </Text>
              {metric.suffix ? <Text className="text-[11px] text-outline">{metric.suffix}</Text> : null}
            </View>
            <Text className="mt-0.5 text-[11px] text-on-surface-variant" numberOfLines={1}>
              {metric.caption}
            </Text>
          </View>
        ))}
      </View>
      {error ? (
        <Text className="mt-2 text-[11px] text-error">{error}</Text>
      ) : null}
    </View>
  );
}
