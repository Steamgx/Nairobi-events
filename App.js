import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as Calendar from 'expo-calendar';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const CATEGORIES = ['All', 'Music', 'Tech', 'Art'];

const dummyEvents = [
 {
    id: '1',
    name: 'Nairobi Afro Festival',
    category: 'Music',
    date: '2025-08-10T14:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500',
    location: 'Carnivore Grounds, Nairobi',
    price: 'Ksh 2,500',
    description: 'Experience the best of African music with performances from Sauti Sol, Burna Boy and more!',
  },
  {
    id: '2',
    name: 'Tech Safari Conference',
    category: 'Tech',
    date: '2025-09-15T09:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
    location: 'KICC, Nairobi',
    price: 'Ksh 7,500',
    description: 'East Africa\'s premier tech conference featuring speakers from Silicon Savannah',
  },
  {
    id: '3',
    name: 'Maasai Market Art Expo',
    category: 'Art',
    date: '2025-07-22T10:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500',
    location: 'Village Market, Nairobi',
    price: 'Free',
    description: 'Traditional and contemporary African art from local artisans',
  },
  {
    id: '4',
    name: 'Safari Sevens Rugby',
    category: 'Sports',
    date: '2025-08-05T08:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=500',
    location: 'Nyayo Stadium, Nairobi',
    price: 'Ksh 1,500',
    description: 'Kenya\'s premier international rugby tournament',
  },
  {
    id: '5',
    name: 'Jazz Night at Alliance',
    category: 'Music',
    date: '2025-07-30T19:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=500',
    location: 'Alliance Française, Nairobi',
    price: 'Ksh 1,200',
    description: 'An evening of smooth jazz with Nairobi\'s finest musicians',
  },
  {
    id: '6',
    name: 'Startup Pitch Night',
    category: 'Tech',
    date: '2025-09-01T13:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
    location: 'iHub, Nairobi',
    price: 'Free',
    description: 'Monthly startup pitch competition with KSh 1M in prizes',
  },
  {
    id: '7',
    name: 'Taste of Nairobi',
    category: 'Food',
    date: '2025-08-15T11:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
    location: 'The Hub, Karen',
    price: 'Ksh 2,000',
    description: 'Food festival showcasing Nairobi\'s diverse culinary scene',
  },
  {
    id: '8',
    name: 'Yoga at Arboretum',
    category: 'Wellness',
    date: '2025-07-25T08:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500',
    location: 'Nairobi Arboretum',
    price: 'Ksh 500',
    description: 'Morning yoga session surrounded by nature with certified instructors',
  },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedEvents, setSavedEvents] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [rsvpEventName, setRsvpEventName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [pickerMode, setPickerMode] = useState(null); // 'start' or 'end'

  const filteredEvents =
    selectedCategory === 'All'
      ? dummyEvents
      : dummyEvents.filter((event) => event.category === selectedCategory);

  const toggleSaveEvent = (eventId) => {
    setSavedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleRSVP = (event) => {
    setSelectedEvent(event);
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 60 * 60 * 1000));
    setPickerMode('start');
  };

  const handleConfirm = (date) => {
    if (pickerMode === 'start') {
      setStartDate(date);
      setPickerMode('end');
    } else if (pickerMode === 'end') {
      setEndDate(date);
      setPickerMode(null);
      addToCalendar();
    }
  };

  const handleCancel = () => {
    setPickerMode(null);
  };

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable calendar access to add events.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendar = calendars.find((cal) => cal.allowsModifications) || calendars[0];

      await Calendar.createEventAsync(calendar.id, {
        title: selectedEvent.name,
        startDate: startDate,
        endDate: endDate,
        location: selectedEvent.location || 'Nairobi',
        notes: selectedEvent.description || 'RSVP via M-Pesa: 0769998718',
        timeZone: 'Africa/Nairobi',
        alarms: [
          {
            relativeOffset: -10, // 10 mins before
            method: Calendar.AlarmMethod.ALERT,
          },
        ],
      });

      setRsvpEventName(selectedEvent.name);
      setPaymentModalVisible(true);
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Calendar Error', 'Could not add to calendar.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎉 Nairobi Events</Text>
        <Button mode="outlined" onPress={() => setShowSaved((prev) => !prev)}>
          {showSaved ? 'Show All Events' : 'View Saved Events'}
        </Button>
      </View>

      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            mode={selectedCategory === cat ? 'contained' : 'outlined'}
            onPress={() => setSelectedCategory(cat)}
            style={styles.categoryButton}
          >
            {cat}
          </Button>
        ))}
      </View>

      <FlatList
        data={(showSaved ? dummyEvents.filter((e) => savedEvents.includes(e.id)) : filteredEvents)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Image source={{ uri: item.image }} style={styles.eventImage} />
            <Text style={styles.eventName}>{item.name}</Text>
            <Text style={styles.eventDesc}>{item.description}</Text>
            <Text style={styles.eventLoc}>📍 {item.location}</Text>

            <View style={styles.buttonsRow}>
              <TouchableOpacity onPress={() => handleRSVP(item)} style={styles.rsvpButton}>
                <Text style={styles.rsvpText}>RSVP</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleSaveEvent(item.id)} style={styles.saveButton}>
                <Text style={styles.saveText}>
                  {savedEvents.includes(item.id) ? 'Unsave' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal: Payment after RSVP */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Payment Instructions</Text>
          <Text style={styles.modalText}>
            To book your ticket for <Text style={{ fontWeight: 'bold' }}>{rsvpEventName}</Text>,
            send payment via M-Pesa to:
          </Text>
          <Text style={styles.mpesaNumber}>📞 0769998718</Text>
          <Button onPress={() => setPaymentModalVisible(false)} mode="contained" style={{ marginTop: 10 }}>
            Done
          </Button>
        </View>
      </Modal>

      {/* Modal DateTime Picker */}
      <DateTimePickerModal
        isVisible={!!pickerMode}
        mode="datetime"
        date={pickerMode === 'start' ? startDate : endDate}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fd',
  },
  header: {
    padding: 16,
    backgroundColor: '#2a9df4',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  categoryButton: {
    marginHorizontal: 5,
  },
  eventCard: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
  },
  eventDesc: {
    fontSize: 14,
    color: '#444',
    marginHorizontal: 10,
  },
  eventLoc: {
    marginHorizontal: 10,
    marginBottom: 10,
    color: '#888',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  rsvpButton: {
    backgroundColor: '#2a9df4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rsvpText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    borderColor: '#2a9df4',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveText: {
    color: '#2a9df4',
    fontWeight: 'bold',
  },
  modalView: {
    marginTop: 'auto',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  mpesaNumber: {
    fontSize: 20,
    color: '#2a9df4',
    fontWeight: 'bold',
  },
});
