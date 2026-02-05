import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const goalsOptions = ['Sleep', 'Anxiety', 'Focus', 'Stress', 'Self-Esteem', 'General Wellness'];
const soundOptions = ['528hz', '432hz', 'rain', 'ocean', 'forest'];

export default function OnboardingScreen() {
  const { setOnboarded } = useAuthStore();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [duration, setDuration] = useState('15');
  const [sound, setSound] = useState('528hz');

  const toggleGoal = (goal: string) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const handleFinish = async () => {
    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        onboarding_answers: { goals, duration: Number(duration), sound },
        preferred_duration: Number(duration),
        preferred_frequency: sound,
        goals
      })
    });

    setOnboarded(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let’s personalize your sessions</Text>

      {step === 0 && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Your goals</Text>
          <View style={styles.tagContainer}>
            {goalsOptions.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[styles.tag, goals.includes(goal) ? styles.tagActive : null]}
                onPress={() => toggleGoal(goal)}
              >
                <Text style={goals.includes(goal) ? styles.tagTextActive : styles.tagText}>{goal}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Preferred duration</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />
          <Text style={styles.helper}>Minutes (10–30)</Text>
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Background sound</Text>
          <View style={styles.tagContainer}>
            {soundOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.tag, sound === option ? styles.tagActive : null]}
                onPress={() => setSound(option)}
              >
                <Text style={sound === option ? styles.tagTextActive : styles.tagText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep((prev) => Math.max(prev - 1, 0))}
          disabled={step === 0}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        {step < 2 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep((prev) => prev + 1)}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
            <Text style={styles.primaryButtonText}>Finish</Text>
          </TouchableOpacity>
        )}
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B3A5C',
    marginBottom: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: '#CBD5F5',
    borderWidth: 1,
    marginBottom: 8
  },
  tagActive: {
    backgroundColor: '#2C7A7B',
    borderColor: '#2C7A7B'
  },
  tagText: {
    color: '#1B3A5C'
  },
  tagTextActive: {
    color: '#FFFFFF'
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: 120
  },
  helper: {
    marginTop: 8,
    color: '#6B7280'
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  primaryButton: {
    backgroundColor: '#2C7A7B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderColor: '#CBD5F5',
    borderWidth: 1
  },
  secondaryButtonText: {
    color: '#1B3A5C'
  }
});
