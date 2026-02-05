import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiFetch } from '../lib/api';

export default function FeedbackScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [rating, setRating] = useState(5);
  const [helpful, setHelpful] = useState(true);
  const [tooLong, setTooLong] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const [notes, setNotes] = useState('');

  const submit = async () => {
    await apiFetch(`/sessions/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        rating,
        helpful,
        too_long: tooLong,
        too_short: tooShort,
        notes
      })
    });
    navigation.navigate('Dashboard' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How was your session?</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Rating</Text>
        <View style={styles.row}>
          {[5, 4, 3, 2, 1].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, rating === value ? styles.chipActive : null]}
              onPress={() => setRating(value)}
            >
              <Text style={rating === value ? styles.chipTextActive : styles.chipText}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          {[
            { label: 'Helpful', value: helpful, setter: setHelpful },
            { label: 'Too long', value: tooLong, setter: setTooLong },
            { label: 'Too short', value: tooShort, setter: setTooShort }
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.toggle}
              onPress={() => item.setter(!item.value)}
            >
              <Text style={styles.toggleLabel}>{item.label}</Text>
              <Text style={styles.toggleValue}>{item.value ? 'Yes' : 'No'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Notes</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Optional notes"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>Submit feedback</Text>
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
  row: {
    flexDirection: 'row',
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
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  toggleLabel: {
    color: '#1B3A5C'
  },
  toggleValue: {
    color: '#6B7280'
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    marginTop: 8,
    textAlignVertical: 'top'
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
  }
});
