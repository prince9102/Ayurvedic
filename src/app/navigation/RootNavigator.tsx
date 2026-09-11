import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Text, Linking } from 'react-native';
import { useTheme } from '../../core/theme/ThemeProvider';
import { ConsultationNavigator } from '../../features/consultation/navigation/ConsultationNavigator';
import { ShopNavigator } from '../../features/shop/navigation/ShopNavigator';
import { HealthRecordsNavigator } from '../../features/health-records/navigation/HealthRecordsNavigator';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { logger } from '../../core/logging/logger';

export type RootTabParamList = {
  ConsultationTab: undefined;
  ShopTab: undefined;
  RecordsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const SettingsStack = createNativeStackNavigator();

function SettingsStackNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
    </SettingsStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const { colors } = useTheme();
  const icons: Record<string, string> = {
    ConsultationTab: '🩺',
    ShopTab: '🛒',
    RecordsTab: '📋',
    SettingsTab: '⚙️',
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.6 }}>
      {icons[label] ?? '•'}
    </Text>
  );
}

const linking = {
  prefixes: ['ayurvedic://'],
  config: {
    screens: {
      ConsultationTab: {
        screens: {
          DoctorList: 'consult',
          DoctorDetail: 'consult/doctor/:doctorId',
          UpcomingBookings: 'consult/bookings',
        },
      },
      ShopTab: {
        screens: {
          ProductList: 'shop',
          ProductDetail: 'shop/product/:productId',
          Cart: 'shop/cart',
        },
      },
      RecordsTab: {
        screens: {
          RecordsTimeline: 'records',
          RecordDetail: 'records/:recordId',
        },
      },
      SettingsTab: 'settings',
    },
  },
};

export { linking };

export function RootNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      logger.info('Deep link received', { url });
    });
    return () => sub.remove();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarAccessibilityLabel: route.name,
      })}
    >
      <Tab.Screen
        name="ConsultationTab"
        component={ConsultationNavigator}
        options={{ title: t('tabs.consultation') }}
      />
      <Tab.Screen name="ShopTab" component={ShopNavigator} options={{ title: t('tabs.shop') }} />
      <Tab.Screen
        name="RecordsTab"
        component={HealthRecordsNavigator}
        options={{ title: t('tabs.records') }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{ title: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
}
