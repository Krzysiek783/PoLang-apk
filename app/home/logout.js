import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF9F5', padding: 16 }}>
      
      {/* Nagłówek */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>👋 Witaj, testowy1</Text>
        <Text style={{ color: '#777', fontStyle: 'italic', marginTop: 4 }}>
          „Small progress is still progress.”
        </Text>
      </View>

      {/* Pasek celu */}
      <View style={{
        backgroundColor: '#F1ECFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
      }}>
        <Text style={{ fontWeight: '600' }}>Twój dzisiejszy cel:</Text>
        <View style={{
          height: 10,
          backgroundColor: '#D1C4E9',
          borderRadius: 10,
          marginTop: 8,
          overflow: 'hidden',
        }}>
          <View style={{
            height: '100%',
            width: '60%',
            backgroundColor: '#7C4DFF',
            borderRadius: 10,
          }} />
        </View>
        <Text style={{ marginTop: 6, color: '#555' }}>60% ukończone</Text>
      </View>

      {/* Kafelek: Ostatnia lekcja */}
      <Card
        icon={<Ionicons name="book" size={24} color="#3E3E3E" />}
        title="Ostatnia lekcja"
        description="Brak"
        backgroundColor="#FFE7D6"
      />

      {/* Kafelek: Kontynuuj naukę */}
      <Card
        icon={<Ionicons name="rocket" size={24} color="#3E3E3E" />}
        title="Kontynuuj naukę"
        description="Kliknij aby rozpocząć"
        backgroundColor="#D6F5E7"
      />

      {/* Kafelek: Twoje statystyki */}
      <Card
        icon={<MaterialCommunityIcons name="chart-bar" size={24} color="#3E3E3E" />}
        title="Twoje statystyki"
        description="Zobacz swój postęp"
        backgroundColor="#D6E9FF"
      />
    </ScrollView>
  );
}

function Card({ icon, title, description, backgroundColor }) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          {icon}
        </View>
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
          <Text style={{ color: '#555', fontSize: 13 }}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
