import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signUp } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    try {
      await signUp(email, password, name);
      navigation.navigate('Login' as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Start your personalized meditation journey.</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSignup}>
        <Text style={styles.primaryButtonText}>Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F5F1E8'
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1B3A5C'
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: '#4B5563'
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1
  },
  primaryButton: {
    backgroundColor: '#2C7A7B',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  link: {
    marginTop: 16,
    color: '#2C7A7B',
    textAlign: 'center'
  },
  error: {
    color: '#DC2626',
    marginBottom: 8
  }
});
