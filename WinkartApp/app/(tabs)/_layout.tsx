import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused, label }: { name: any; focused: boolean; label: string }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? name : `${name}-outline` as any}
        size={24}
        color={focused ? Colors.primary : Colors.tabIconDefault}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} label="Categories" />,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="document-text" focused={focused} label="My Bills" />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="cart" focused={focused} label="Cart" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} label="Profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAF5',
    paddingTop: 4,
    paddingBottom: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#9BA8BC',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#3D5AFE',
  },
});
