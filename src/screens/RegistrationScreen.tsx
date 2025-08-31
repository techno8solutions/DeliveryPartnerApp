import React, { use, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  PermissionsAndroid,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { ActivityIndicator } from 'react-native-paper';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { ROUTES } from '~/constants/routes';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/navigations/types';
import { setSignUpToken } from '~/redux/features/auth/authSlice';

interface FormData {
  // Personal Information
  full_name: string;
  gender: 'male' | 'female' | 'other';
  phone_number: string;
  email: string;
  DOB: Date;

  // Contact Information
  emergency_contact_name: string;
  emergency_contact_number: string;

  // Address Information
  street_address: string;
  city: string;
  postal_code: string;
  government_id: string | null;
  residential_proof: string | null;

  // Vehicle Information
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  license_expiry: string;
  insurance_number: string;
  insurance_expiry: string;
  license_photo_url: string | null;
  vehicle_photo_url: string | null;

  // Visa Information
  account_holder_name: string | boolean;
  ni_number: number | null;
  account_number: number | boolean | null;
  sort_code: number | boolean | null;

  // Documents
  profile_photo_url: string | null;

  // Availability
  availability_schedule: AvailabilitySchedule;
  // System Fields
  availability_status: 'online' | 'offline' | 'busy' | 'on_break';
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  onboarding_completed: boolean;
  total_deliveries: number;
  successful_deliveries: number;
  rating_average: number;
  total_ratings: number;
  commission_rate: number;
}
type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type TimeSlot = 'morning' | 'afternoon' | 'evening';

type AvailabilitySchedule = {
  [key in Day]: {
    [slot in TimeSlot]: boolean;
  };
};
interface ReviewItemProps {
  label: string;
  value: string | null | undefined;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}
interface ReviewDocumentProps {
  label: string | null;
  value: string | null | undefined;
}
interface VehicleOption {
  label: string;
  value: string;
}
const RegistrationScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [licenseExpiry, setLicenseExpiry] = useState<Date>(new Date());
  const [showLicenseExpiryPicker, setShowLicenseExpiryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInsuranceExpiryPicker, setShowInsuranceExpiryPicker] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    gender: 'male',
    phone_number: '',
    email: '',
    DOB: new Date(),

    // Contact Information
    emergency_contact_name: '',
    emergency_contact_number: '',

    // Address Information
    street_address: '',
    city: '',
    postal_code: '',
    government_id: null,
    residential_proof: null,

    // Vehicle Information
    vehicle_type: 'bicycle',
    vehicle_number: '',
    license_number: '',
    license_expiry: new Date(),
    insurance_number: '',
    insurance_expiry: new Date(),
    license_photo_url: null,
    vehicle_photo_url: null,

    // Visa Information
    account_holder_name: '',
    ni_number: 0,
    account_number: 0,
    sort_code: 0,

    // Documents
    profile_photo_url: null,

    // Availability
    availability_schedule: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },

    // System Fields (default values)
    availability_status: 'offline',
    verification_status: 'pending',
    onboarding_completed: false,
    total_deliveries: 0,
    successful_deliveries: 0,
    rating_average: 0.0,
    total_ratings: 0,
    commission_rate: 0.15,
  });
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;
  const registrationToken = useSelector((state: RootState) => state.auth.registrationToken);
  const userID = useSelector((state: RootState) => state.auth.userID);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(formData.DOB.getDate());
  const [selectedMonth, setSelectedMonth] = useState(formData.DOB.getMonth());
  const [selectedYear, setSelectedYear] = useState(formData.DOB.getFullYear());

  const vehicleOptions: VehicleOption[] = [
    { label: 'Bicycle', value: 'bicycle' },
    { label: 'Bike', value: 'bike' },
    { label: 'Scooter', value: 'scooter' },
    { label: 'Car', value: 'car' },
    { label: 'Van', value: 'van' },
  ];
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const steps = ['Personal', 'Contact', 'Address', 'Documents', 'Vehicle', 'Schedule', 'Review'];

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const formattedDate =
    selectedDay && selectedMonth !== null && selectedYear
      ? `${selectedDay} ${months[selectedMonth]} ${selectedYear}`
      : '';

  const handleDone = () => {
    setShowDOBPicker(false);
  };
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  const handleDocumentUpload = async <
    K extends keyof Pick<
      FormData,
      | 'government_id'
      | 'residential_proof'
      | 'profile_photo_url'
      | 'license_photo_url'
      | 'vehicle_photo_url'
    >,
  >(
    field: K
  ): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true, // Optional: if you need base64 encoding
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        // For production, you would typically upload to cloud storage here
        // and get back a URL to store in your database
        const imageUri = result.assets[0].uri;

        // Optionally compress the image before uploading
        const compressedImage = await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
        });

        handleInputChange(field, imageUri);

        // Example of cloud upload (pseudo-code):
        // const uploadUrl = await uploadToCloudStorage(imageUri);
        // handleInputChange(field,? uploadUrl);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      alert('Failed to select image');
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined): void => {
    setDatePickerVisible(false);
    if (selectedDate) {
      handleInputChange('DOB', selectedDate);
    }
  };
  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  const handleImageUpload = async (fieldName: string) => {
    try {
      // Request permissions for media library
      if (Platform.OS === 'android') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access media library was denied');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        setFormData((prev) => ({
          ...prev,
          [fieldName]: selectedImage.uri,
        }));
      } else {
        console.log('Image picker cancelled or no asset selected');
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };
  // const handleLicenseExpiryChange = (event: any, selectedDate?: String) => {
  //   setShowLicenseExpiryPicker(false);
  //   if (selectedDate) {
  //     setLicenseExpiry(selectedDate);
  //     // Also update your formData if needed
  //     handleInputChange('license_expiry', selectedDate.toISOString().split('T')[0]);
  //   }
  // };
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const formatDate = (day: number, month: number, year: number): string => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Custom Date Picker Component
  const CustomDatePicker: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const days = Array.from(
      { length: getDaysInMonth(selectedMonth, selectedYear) },
      (_, i) => i + 1
    );

    const handleSave = () => {
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      handleInputChange('DOB', newDate);
      setShowCustomDatePicker(false);
    };

    return (
      <Modal visible={true} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-3/4 rounded-t-3xl bg-white p-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-blue-800">Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowCustomDatePicker(false)}>
                <Ionicons name="close" size={28} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Selected Date Preview */}
            <View className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <Text className="text-center text-lg font-semibold text-blue-800">
                {formatDate(selectedDay, selectedMonth, selectedYear)}
              </Text>
            </View>

            {/* Picker Columns */}
            <View className="mb-6 flex-row justify-between">
              {/* Month Picker */}
              <View className="mr-2 flex-1">
                <Text className="mb-3 text-center font-semibold text-blue-700">Month</Text>
                <ScrollView className="h-40" showsVerticalScrollIndicator={false}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      className={`mb-1 rounded-xl p-3 ${
                        selectedMonth === index ? 'bg-blue-500' : 'bg-blue-50'
                      }`}
                      onPress={() => {
                        setSelectedMonth(index);
                        const daysInMonth = getDaysInMonth(index, selectedYear);
                        if (selectedDay > daysInMonth) {
                          setSelectedDay(daysInMonth);
                        }
                      }}>
                      <Text
                        className={`text-center font-medium ${
                          selectedMonth === index ? 'text-white' : 'text-blue-700'
                        }`}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View className="mx-2 flex-1">
                <Text className="mb-3 text-center font-semibold text-blue-700">Day</Text>
                <ScrollView className="h-40" showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      className={`mb-1 rounded-xl p-3 ${
                        selectedDay === day ? 'bg-blue-500' : 'bg-blue-50'
                      }`}
                      onPress={() => setSelectedDay(day)}>
                      <Text
                        className={`text-center font-medium ${
                          selectedDay === day ? 'text-white' : 'text-blue-700'
                        }`}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View className="ml-2 flex-1">
                <Text className="mb-3 text-center font-semibold text-blue-700">Year</Text>
                <ScrollView className="h-40" showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      className={`mb-1 rounded-xl p-3 ${
                        selectedYear === year ? 'bg-blue-500' : 'bg-blue-50'
                      }`}
                      onPress={() => {
                        setSelectedYear(year);
                        const daysInMonth = getDaysInMonth(selectedMonth, year);
                        if (selectedDay > daysInMonth) {
                          setSelectedDay(daysInMonth);
                        }
                      }}>
                      <Text
                        className={`text-center font-medium ${
                          selectedYear === year ? 'text-white' : 'text-blue-700'
                        }`}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl bg-blue-100 p-4"
                onPress={() => setShowCustomDatePicker(false)}>
                <Text className="font-semibold text-blue-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-xl bg-blue-600 p-4"
                onPress={handleSave}>
                <Text className="font-semibold text-white">Save Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Details
        return (
          <View className="mb-3 rounded-xl border border-blue-100 bg-white p-6 shadow-lg">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-blue-800">Delivery Partner Information</Text>
              <Text className="text-sm text-blue-600">Tell us about yourself</Text>
            </View>

            {/* Full Name Input */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-blue-700">Full Name</Text>
              <View className="flex-row items-center rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <Ionicons name="person" size={22} color="#2563EB" />
                <TextInput
                  className="ml-3 h-12 flex-1 text-base text-blue-900"
                  value={formData.full_name}
                  onChangeText={(text) => handleInputChange('full_name', text)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#93C5FD"
                />
              </View>
            </View>

            {/* Date of Birth Input */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-blue-700">Date of Birth</Text>
              <TouchableOpacity
                className="h-14 flex-row items-center rounded-xl border-2 border-blue-200 bg-blue-50 p-4 active:border-blue-500"
                onPress={() => setShowCustomDatePicker(true)}
                activeOpacity={0.7}>
                <Ionicons name="calendar" size={22} color="#2563EB" />
                <Text className="ml-3 flex-1 text-base text-blue-900">
                  {formData.DOB.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Ionicons name="chevron-down" size={24} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Gender Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-blue-700">Gender</Text>
              <View className="flex-row items-center rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <Ionicons name="transgender" size={22} color="#2563EB" />
                <Text className="ml-3 flex-1 text-base text-blue-900">
                  {formData.gender
                    ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
                    : 'Select Gender'}
                </Text>
                <Ionicons name="chevron-down" size={24} color="#2563EB" />
              </View>
            </View>

            {/* Custom Date Picker Modal */}
            {showCustomDatePicker && <CustomDatePicker />}
          </View>
        );
      case 1: // Contact Details
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Contact Information</Text>
              <Text className="text-sm text-gray-500">How can we reach you?</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Phone Number</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="phone" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.phone_number}
                  onChangeText={(text) => handleInputChange('phone_number', text)}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Email ID</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="email" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  placeholder="Enter email address"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Emergency Contact Name
              </Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="contact-emergency" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.emergency_contact_name}
                  onChangeText={(text) => handleInputChange('emergency_contact_name', text)}
                  placeholder="Emergency contact name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Emergency Contact Phone
              </Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="phone" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.emergency_contact_number}
                  onChangeText={(text) => handleInputChange('emergency_contact_number', text)}
                  keyboardType="phone-pad"
                  placeholder="Emergency contact phone"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        );

      case 2: // Address Details
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Address Details</Text>
              <Text className="text-sm text-gray-500">Where do you live?</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Street Address</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="home" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.street_address}
                  onChangeText={(text) => handleInputChange('street_address', text)}
                  placeholder="Street and house number"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">City</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="location-city" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.city}
                  onChangeText={(text) => handleInputChange('city', text)}
                  placeholder="City"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Postal Code</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="markunread-mailbox" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.postal_code}
                  onChangeText={(text) => handleInputChange('postal_code', text)}
                  keyboardType="number-pad"
                  placeholder="Postal code"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        );

      case 3: // Document Uploads
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Document Uploads</Text>
              <Text className="text-sm text-gray-500">Upload required documents</Text>
            </View>

            <View className="mb-5">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Government ID</Text>
              <TouchableOpacity
                className="h-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleDocumentUpload('government_id')}>
                {formData.government_id ? (
                  <Image
                    source={{ uri: formData.government_id }}
                    className="h-full w-full bg-gray-100"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="id-card-o" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload Government ID</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Profile Photo</Text>
              <TouchableOpacity
                className="h-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleImageUpload('profile_photo_url')}>
                {formData.profile_photo_url ? (
                  <Image
                    source={{ uri: formData.profile_photo_url }}
                    className="h-full w-full rounded-lg"
                  />
                ) : (
                  <View className="items-center">
                    <MaterialIcons name="add-a-photo" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload Profile Photo</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* License Photo */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">License Copy</Text>
              <TouchableOpacity
                className="h-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleImageUpload('license_photo_url')}>
                {formData.license_photo_url ? (
                  <Image
                    source={{ uri: formData.license_photo_url }}
                    className="h-full w-full rounded-lg"
                  />
                ) : (
                  <View className="items-center">
                    <MaterialIcons name="picture-as-pdf" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload License Copy</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Vehicle Photo */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Vehicle Photo</Text>
              <TouchableOpacity
                className="h-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleImageUpload('vehicle_photo_url')}>
                {formData.vehicle_photo_url ? (
                  <Image
                    source={{ uri: formData.vehicle_photo_url }}
                    className="h-full w-full rounded-lg"
                  />
                ) : (
                  <View className="items-center">
                    <MaterialIcons name="directions-car" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload Vehicle Photo</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Residential Proof */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Residential Proof</Text>
              <TouchableOpacity
                className="h-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleImageUpload('residential_proof')}>
                {formData.residential_proof ? (
                  <Image
                    source={{ uri: formData.residential_proof }}
                    className="h-full w-full rounded-lg"
                  />
                ) : (
                  <View className="items-center">
                    <MaterialIcons name="home-work" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload Residential Proof</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4: // Vehicle and Document Details
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Vehicle & Documents</Text>
              <Text className="text-sm text-gray-500">
                Provide your vehicle and document details
              </Text>
            </View>

            {/* Vehicle Type */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Vehicle Type</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="directions-car" size={20} color="#6b7280" />
                <Picker
                  selectedValue={formData.vehicle_type}
                  onValueChange={(itemValue) => handleInputChange('vehicle_type', itemValue)}
                  style={{ flex: 1 }}
                  mode="dropdown">
                  <Picker.Item label="Select Vehicle Type" value="" />
                  <Picker.Item label="Bicycle" value="bicycle" />
                  <Picker.Item label="Motorcycle" value="motorcycle" />
                  <Picker.Item label="Car" value="car" />
                  <Picker.Item label="Van" value="van" />
                </Picker>
              </View>
            </View>

            {/* Vehicle Number */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Vehicle Number</Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.vehicle_number}
                onChangeText={(text) => handleInputChange('vehicle_number', text)}
                placeholder="Enter vehicle registration number"
              />
            </View>

            {/* License Number */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">License Number</Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.license_number}
                onChangeText={(text) => handleInputChange('license_number', text)}
                placeholder="Enter driving license number"
              />
            </View>

            {/* License Expiry */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">License Expiry Date</Text>
              <TouchableOpacity
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                onPress={() => setShowLicenseExpiryPicker(true)}>
                <Text>
                  {formData.license_expiry
                    ? new Date(formData.license_expiry).toLocaleDateString()
                    : 'Select expiry date'}
                </Text>
              </TouchableOpacity>
              {showLicenseExpiryPicker && (
                <DateTimePicker
                  value={formData.license_expiry ? new Date(formData.license_expiry) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowLicenseExpiryPicker(false);
                    if (date) {
                      handleInputChange('license_expiry', date.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>

            {/* Insurance Number */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Insurance Number</Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.insurance_number}
                onChangeText={(text) => handleInputChange('insurance_number', text)}
                placeholder="Enter insurance policy number"
              />
            </View>

            {/* Insurance Expiry */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Insurance Expiry Date
              </Text>
              <TouchableOpacity
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                onPress={() => setShowInsuranceExpiryPicker(true)}>
                <Text>
                  {formData.insurance_expiry
                    ? new Date(formData.insurance_expiry).toLocaleDateString()
                    : 'Select expiry date'}
                </Text>
              </TouchableOpacity>
              {showInsuranceExpiryPicker && (
                <DateTimePicker
                  value={
                    formData.insurance_expiry ? new Date(formData.insurance_expiry) : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowInsuranceExpiryPicker(false);
                    if (date) {
                      handleInputChange('insurance_expiry', date.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>
          </View>
        );

      case 5: // Visa and Additional Info
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Bank & Additional Information</Text>
              <Text className="text-sm text-gray-500">Provide your visa details</Text>
            </View>

            {/* Visa Type */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Account Holder Name</Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.account_holder_name}
                onChangeText={(text) => handleInputChange('account_holder_name', text)}
                placeholder="Enter your visa type"
              />
            </View>

            {/* NI Number */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                National Insurance Number
              </Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.ni_number.toString() || ''}
                onChangeText={(text) =>
                  handleInputChange('ni_number', text === '' ? null : Number(text))
                }
                placeholder="Enter NI number"
                keyboardType="numeric"
              />
            </View>

            {/* Student Visa */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Account Number</Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.account_number !== null ? String(formData.account_number) : ''}
                onChangeText={(text) =>
                  handleInputChange('account_number', text === '' ? null : Number(text))
                }
                placeholder="Enter Student Visa number"
                keyboardType="numeric"
              />
            </View>

            {/* PSW Visa */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">sort_code Number</Text>
              <TextInput
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                value={formData.sort_code?.toString() || ''}
                onChangeText={(value) =>
                  handleInputChange('sort_code', value === '' ? null : Number(value))
                }
                placeholder="Enter PSW Visa number"
                keyboardType="numeric"
              />
            </View>

            {/* Availability Schedule */}
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">
                Availability Schedule
              </Text>
              <View className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => {
                    const lowerDay = day.toLowerCase() as Day;

                    return (
                      <View key={day} className="mb-2 flex-row items-center justify-between">
                        <Text className="text-gray-700">{day}</Text>
                        <View className="flex-row">
                          {['Morning', 'Afternoon', 'Evening'].map((slot) => {
                            const lowerSlot = slot.toLowerCase() as TimeSlot;

                            return (
                              <TouchableOpacity
                                key={slot}
                                className={`ml-2 rounded px-2 py-1 ${
                                  formData.availability_schedule[lowerDay][lowerSlot]
                                    ? 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                                onPress={() => {
                                  const updated = { ...formData.availability_schedule };
                                  updated[lowerDay] = {
                                    ...updated[lowerDay],
                                    [lowerSlot]: !updated[lowerDay][lowerSlot],
                                  };
                                  handleInputChange('availability_schedule', updated);
                                }}>
                                <Text
                                  className={`text-xs ${
                                    formData.availability_schedule[lowerDay][lowerSlot]
                                      ? 'text-white'
                                      : 'text-gray-600'
                                  }`}>
                                  {slot}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            </View>
          </View>
        );
      case 6:
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Review Your Information</Text>
              <Text className="text-sm text-gray-500">
                Please verify all details before submission
              </Text>
            </View>

            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              {/* Personal Details Section */}
              <View className="mb-6 rounded-lg border border-gray-100 p-4">
                <View className="mb-3 flex-row items-center">
                  <MaterialIcons name="person-outline" size={20} color="#6b7280" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">
                    Personal Details
                  </Text>
                </View>
                <ReviewItem label="Full Name" value={formData.full_name} icon="person" />
                <ReviewItem
                  label="Date of Birth"
                  value={formData.DOB ? formData.DOB.toDateString() : 'Not provided'}
                  icon="event"
                />
                <ReviewItem
                  label="Gender"
                  value={formData.gender || 'Not specified'}
                  icon="transgender"
                />
              </View>

              {/* Contact Information Section */}
              <View className="mb-6 rounded-lg border border-gray-100 p-4">
                <View className="mb-3 flex-row items-center">
                  <MaterialIcons name="contact-phone" size={20} color="#6b7280" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">
                    Contact Information
                  </Text>
                </View>
                <ReviewItem label="Phone Number" value={formData.phone_number} icon="phone" />
                <ReviewItem label="Email" value={formData.email || 'Not provided'} icon="email" />
                <ReviewItem
                  label="Emergency Contact"
                  value={
                    formData.emergency_contact_name
                      ? `${formData.emergency_contact_name} (${formData.emergency_contact_number})`
                      : 'Not provided'
                  }
                  icon="contact-emergency"
                />
              </View>

              {/* Address Section */}
              <View className="mb-6 rounded-lg border border-gray-100 p-4">
                <View className="mb-3 flex-row items-center">
                  <MaterialIcons name="location-on" size={20} color="#6b7280" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">Address</Text>
                </View>
                <ReviewItem label="Street" value={formData.street_address} icon="home" />
                <ReviewItem label="City" value={formData.city} icon="location-city" />
                <ReviewItem
                  label="Postal Code"
                  value={formData.postal_code}
                  icon="markunread-mailbox"
                />
                {/* {formData.additional_address_info && (
            <ReviewItem 
              label="Additional Info" 
              value={formData.additionalAddressInfo} 
              icon="info-outline" 
            />
          )} */}
              </View>

              {/* Vehicle Information Section */}
              {formData.vehicle_type && (
                <View className="mb-6 rounded-lg border border-gray-100 p-4">
                  <View className="mb-3 flex-row items-center">
                    <MaterialIcons name="directions-car" size={20} color="#6b7280" />
                    <Text className="ml-2 text-base font-semibold text-gray-900">
                      Vehicle Information
                    </Text>
                  </View>
                  <ReviewItem
                    label="Vehicle Type"
                    value={formData.vehicle_type}
                    icon="directions-car"
                  />
                  {/* <ReviewItem 
              label="Registration" 
              value={formData.vehicle_registration} 
              icon="confirmation-number" 
            /> */}
                  {/* {/* {formData.vehicleMake && (
              <ReviewItem label="Make" value={formData.vehicleMake} icon="build" />
            )} */}
                  {formData.government_id && (
                    <ReviewItem label="Model" value={formData.government_id} icon="time-to-leave" />
                  )}
                </View>
              )}

              {/* Documents Section */}
              <View className="mb-6 rounded-lg border border-gray-100 p-4">
                <View className="mb-3 flex-row items-center">
                  <MaterialIcons name="folder" size={20} color="#6b7280" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">Documents</Text>
                </View>
                <View className="grid gap-3">
                  <ReviewDocument label="Address Proof" value={formData.residential_proof} />
                  <ReviewDocument label="Selfie" value={formData.profile_photo_url} />
                  {/* {formData.vehicle_insurance && (
              <ReviewDocument 
                label="Vehicle Insurance" 
                value={formData.vehicleInsurance} 
                onPress={() => handleViewDocument(formData.vehicleInsurance)} 
              />
            )} */}
                  <ReviewDocument label="Driving License" value={formData.license_photo_url} />
                </View>
              </View>
            </ScrollView>

            {/* Edit Button */}
            <TouchableOpacity
              className="mt-4 flex-row items-center justify-center"
              onPress={() => setCurrentStep(0)} // Go back to first step
            >
              <MaterialIcons name="edit" size={18} color="#3b82f6" />
              <Text className="ml-2 text-blue-500">Edit Information</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const ReviewItem: React.FC<ReviewItemProps> = ({ label, value, icon }) => (
    <View className="mb-3 flex-row">
      <MaterialIcons name={icon} size={20} color="#6b7280" className="mr-2.5 mt-1" />
      <View className="flex-1">
        <Text className="mb-1 text-xs text-gray-500">{label}</Text>
        <Text className="text-base text-gray-900">{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  const ReviewDocument: React.FC<ReviewDocumentProps> = ({ label, value }) => (
    <View className="mb-3 flex-row">
      <MaterialIcons name="attach-file" size={20} color="#6b7280" className="mr-2.5 mt-1" />
      <View className="flex-1">
        <Text className="mb-1 text-xs text-gray-500">{label}</Text>
        <Text className={`text-base ${value ? 'text-green-500' : 'text-red-500'}`}>
          {value ? 'Uploaded' : 'Missing'}
        </Text>
      </View>
    </View>
  );
  const initialFormState = {
    full_name: '',
    gender: 'male',
    phone_number: '',
    email: '',
    DOB: new Date(),
    emergency_contact_name: '',
    emergency_contact_number: '',
    street_address: '',
    city: '',
    postal_code: '',
    government_id: null,
    residential_proof: null,
    vehicle_type: 'bicycle',
    vehicle_number: '',
    license_number: '',
    license_expiry: new Date(),
    insurance_number: '',
    insurance_expiry: new Date(),
    license_photo_url: null,
    vehicle_photo_url: null,
    account_holder_name: '',
    ni_number: '',
    account_number: '',
    sort_code: '',
    profile_photo_url: null,
    availability_schedule: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    availability_status: 'offline',
    verification_status: 'pending',
    onboarding_completed: false,
    total_deliveries: 0,
    successful_deliveries: 0,
    rating_average: 0.0,
    total_ratings: 0,
    commission_rate: 0.15,
  };
  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData directly without the helper function
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('DOB', formData.DOB?.toISOString().split('T')[0]);
      formDataToSend.append('emergency_contact_name', formData.emergency_contact_name);
      formDataToSend.append('emergency_contact_number', formData.emergency_contact_number);
      formDataToSend.append('street_address', formData.street_address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('postal_code', formData.postal_code);
      formDataToSend.append('vehicle_type', formData.vehicle_type);
      formDataToSend.append('vehicle_number', formData.vehicle_number);
      formDataToSend.append('license_number', formData.license_number);
      formDataToSend.append('license_expiry', formData.license_expiry);
      formDataToSend.append('insurance_number', formData.insurance_number);
      formDataToSend.append('insurance_expiry', formData.insurance_expiry);
      formDataToSend.append('account_holder_name', formData.account_holder_name);
      formDataToSend.append('ni_number', formData.ni_number);
      formDataToSend.append('account_number', formData.account_number ? 'true' : 'false');
      formDataToSend.append('sort_code', formData.sort_code ? 'true' : 'false');
      formDataToSend.append(
        'availability_schedule',
        JSON.stringify(formData.availability_schedule)
      );
      formDataToSend.append('verification_status', formData.verification_status);
      formDataToSend.append('commission_rate', formData.commission_rate);

      // Add files with proper React Native format
      const addFile = (fieldName, fileUri, fileName) => {
        if (fileUri) {
          formDataToSend.append(fieldName, {
            uri: fileUri,
            type: 'image/jpeg',
            name: fileName,
          });
        }
      };

      addFile('government_id', formData.government_id, 'government_id.jpg');
      addFile('residential_proof', formData.residential_proof, 'residential_proof.jpg');
      addFile('license_photo_url', formData.license_photo_url, 'license_photo.jpg');
      addFile('vehicle_photo_url', formData.vehicle_photo_url, 'vehicle_photo.jpg');
      addFile('profile_photo_url', formData.profile_photo_url, 'profile_photo.jpg');

      console.log('FormData contents:');

      // const source = axios.CancelToken.source();
      // const timeout = setTimeout(() => {
      //   source.cancel('Request timeout');
      // }, 30000);
      const response = await axios.post(
        `${backendUrl}/delivery-partner/auth/register`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${registrationToken}`,
          },
        }
      );
      // clearTimeout(timeout);

      console.log(response);
      if (response.data.success) {
        Alert.alert('Success', 'Application submitted successfully!');
        dispatch(setSignUpToken({ token: response.data.token }));
        navigation.navigate(ROUTES.DASHBOARD);
      } else {
        throw new Error(response.data.message || 'Unexpected response');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        Alert.alert('Timeout', 'The request took too long. Please try again.');
      } else {
        console.log(error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Network error. Please check your connection.';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={['#3b82f6', '#2563eb']}
        className="rounded-b-xl p-5 pb-7 pt-12"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
        <View className={`items-center ${Platform.OS === 'ios' ? 'pt-2' : ''}`}>
          <Text
            className={`text-2xl font-bold text-white ${Platform.OS === 'ios' ? 'font-semibold' : 'font-bold'}`}
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              ...Platform.select({
                ios: {
                  fontSize: 24,
                  lineHeight: 32,
                },
                android: {
                  fontSize: 22,
                  lineHeight: 30,
                },
              }),
            }}>
            Driver Registration
          </Text>

          <View className="mt-2 flex-row items-center">
            <Text className="mr-1 text-sm text-blue-100">
              Step {currentStep + 1} of {steps.length}
            </Text>
            {/* Progress Bar */}
            <View className="h-1 flex-1 rounded-full bg-blue-300 bg-opacity-50">
              <View
                className="h-1 rounded-full bg-white"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  ...Platform.select({
                    android: {
                      elevation: 2,
                    },
                  }),
                }}
              />
            </View>
          </View>

          {Platform.OS === 'ios' && (
            <View className="mt-3">
              <MaterialIcons name="directions-car" size={24} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Progress Steps */}
      <View className="mx-5 -mt-5 flex-row justify-between rounded-lg bg-white px-3 py-5 shadow-sm">
        {steps.map((step, index) => (
          <View key={index} className="flex-1 items-center">
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
              <Text
                className={`font-bold ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                {index + 1}
              </Text>
            </View>
            <Text
              className={`mt-1 text-center text-xs ${
                index === currentStep ? 'font-bold text-blue-500' : 'text-gray-400'
              }`}
              numberOfLines={1}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Form Content */}
      <ScrollView className="flex-1 px-5 pt-5">
        {renderStep()}
        <View className="h-5" />
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between border-t border-gray-200 bg-white p-5">
        {currentStep > 0 && (
          <TouchableOpacity
            className="flex-row items-center rounded-lg border border-blue-500 px-5 py-3"
            onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#3b82f6" />
            <Text className="ml-2 font-medium text-blue-500">Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center rounded-lg px-5 py-3 ${
            currentStep === steps.length - 1 ? 'bg-green-500' : 'bg-blue-500'
          } ${currentStep > 0 ? 'ml-3' : ''}`}
          onPress={handleNext}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text className="font-medium text-white">
                {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
              </Text>
              {currentStep < steps.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
