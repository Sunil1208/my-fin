import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/src/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald500,
        tabBarInactiveTintColor: colors.obsidian400,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'house.fill', android: 'home', web: 'home' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="parser"
        options={{
          title: 'Parser',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'terminal.fill', android: 'terminal', web: 'terminal' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="dues"
        options={{
          title: 'Dues',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'calendar.badge.clock', android: 'calendar_month', web: 'calendar_clock' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: 'Sikkim',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'airplane.departure', android: 'flight_takeoff', web: 'flight_takeoff' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'wallet' }} tintColor={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.obsidian800,
    backgroundColor: colors.obsidian950,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0,
  },
});
