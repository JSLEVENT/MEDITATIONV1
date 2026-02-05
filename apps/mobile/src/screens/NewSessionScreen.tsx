import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../lib/api';

const soundOptions = ['528hz', '432hz', 'rain', 'ocean', 'forest'];

export default function NewSessionScreen() {
  const navigation = useNavigation();
  const [rawText, setRawText] = useState('');
  const [duration, setDuration] = useState(15);
  const [sound, setSound] = useState('528hz');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ session_id: string }>('/sessions/create', {
        method: 'POST',
        body: JSON.stringify({ raw_text: rawText, duration_minutes: duration, sound })
      });
      navigation.navigate('SessionDetail' as never, { id: data.session_id } as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Session</Text>
      <Text style={styles.subtitle}>Describe what is on your mind.</Text>

      <TextInput
        style={styles.textarea}
        multiline
        placeholder="What is on your mind today?"
        value={rawText}
        onChangeText={setRawText}
      />

      <Text style={styles.label}>Duration</Text>
      <View style={styles.row}>
        {[10, 15, 20, 25, 30].map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, duration === value ? styles.chipActive : null]}
            onPress={() => setDuration(value)}
          >
            <Text style={duration === value ? styles.chipTextActive : styles.chipText}>{value}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Background sound</Text>
      <View style={styles.row}>
        {soundOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.chip, sound === option ? styles.chipActive : null]}
            onPress={() => setSound(option)}
          >
            <Text style={sound === option ? styles.chipTextActive : styles.chipText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Generating...' : 'Generate my session'}</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Serenity AI is a wellness tool and not a substitute for professional mental health treatment.
      </Text>
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
    color: '#1B3A5C'
  },
  subtitle: {
    marginTop: 4,
    color: '#4B5563'
  },
  textarea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    height: 140,
    marginTop: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    textAlignVertical: 'top'
  },
  label: {
    marginTop: 16,
    color: '#1B3A5C',
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CBD5F5'
  },
  chipActive: {
    backgroundColor: '#2C7A7B',
    borderColor: '#2C7A7B'
  },
  chipText: {
    color: '#1B3A5C'
  },
  chipTextActive: {
    color: '#FFFFFF'
  },
  error: {
    color: '#DC2626',
    marginTop: 12
  },
  primaryButton: {
    backgroundColor: '#2C7A7B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 16
  }
});
