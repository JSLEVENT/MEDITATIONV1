import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { apiFetch } from '../lib/api';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('15');

  useEffect(() => {
    const loadProfile = async () => {
      const data = await apiFetch<{ user: { name: string | null }; profile: { preferred_duration: number } }>(
        '/users/me'
      );
      setName(data.user?.name || '');
      setDuration(String(data.profile?.preferred_duration || 15));
    };

    void loadProfile();
  }, []);

  const save = async () => {
    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, preferred_duration: Number(duration) })
    });
  };

  const openPortal = async () => {
    const data = await apiFetch<{ url: string }>('/subscriptions/portal', { method: 'POST' });
    await Linking.openURL(data.url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={[styles.label, { marginTop: 12 }]}>Preferred duration</Text>
        <TextInput
          style={styles.input}
          value={duration}
          keyboardType="number-pad"
          onChangeText={setDuration}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={save}>
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={openPortal}>
          <Text style={styles.secondaryButtonText}>Manage subscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1B3A5C',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12
  },
  label: {
    color: '#1B3A5C',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginTop: 8
  },
  primaryButton: {
    backgroundColor: '#2C7A7B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1B3A5C'
  }
});
