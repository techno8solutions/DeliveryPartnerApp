import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
  interface FormData {
    fullName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    email: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    street: string;
    city: string;
    postalCode: string;
    addressProof: string | null;
    governmentId: string | null;
    selfie: string | null;
    vehicleType: string;
    vehicleRegistration: string;
    vehicleInsurance: string | null;
    drivingLicense: string | null;
    availability: {
      [key: string]: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
      };
    };
  }

interface ReviewItemProps {
  label: string;
  value: string | null | undefined;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}
interface ReviewDocumentProps {
  label: string;
  value: string | null | undefined;
}

const RegistrationScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dateOfBirth: new Date(),
    gender: 'male',

    // Contact Details
    phoneNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Address Details
    street: '',
    city: '',
    postalCode: '',

    // Documents
    addressProof: null,
    governmentId: null,
    selfie: null,

    // Vehicle Details
    vehicleType: 'bike',
    vehicleRegistration: '',
    vehicleInsurance: null,
    drivingLicense: null,

    // Availability
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const steps = ['Personal', 'Contact', 'Address', 'Documents', 'Vehicle', 'Schedule', 'Review'];


  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDocumentUpload = async <
    K extends keyof Pick<
      FormData,
      'addressProof' | 'governmentId' | 'selfie' | 'vehicleInsurance' | 'drivingLicense'
    >,
  >(
    field: K
  ): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      handleInputChange(field, result.assets[0].uri);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined): void => {
    setDatePickerVisible(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Details
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Personal Information</Text>
              <Text className="text-sm text-gray-500">Tell us about yourself</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Full Name</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="person" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.fullName}
                  onChangeText={(text) => handleInputChange('fullName', text)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">Date of Birth</Text>

              <TouchableOpacity
                className="h-14 flex-row items-center rounded-lg border border-gray-300 bg-gray-50 px-4 active:border-blue-500 active:bg-blue-50"
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.7}>
                <MaterialIcons name="event" size={22} color="#4b5563" />
                <Text className="ml-3 flex-1 text-base text-gray-900">
                  {formData.dateOfBirth.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#6b7280" />
              </TouchableOpacity>

              {datePickerVisible && (
                <View className="mt-2">
                  {Platform.OS === 'ios' ? (
                    <View className="rounded-lg bg-white p-4 shadow-sm">
                      <DateTimePicker
                        value={formData.dateOfBirth}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        textColor="#111827" // iOS only
                        themeVariant="light" // iOS only
                        maximumDate={new Date()} // Prevent future dates
                        locale="en-US"
                      />
                      <TouchableOpacity
                        className="mt-4 items-center self-end rounded-full bg-blue-500 px-6 py-2"
                        onPress={() => setDatePickerVisible(false)}>
                        <Text className="font-medium text-white">Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <DateTimePicker
                      value={formData.dateOfBirth}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      positiveButton={{ label: 'OK', textColor: '#3b82f6' }}
                      negativeButton={{ label: 'Cancel', textColor: '#6b7280' }}
                    />
                  )}
                </View>
              )}
            </View>
            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Gender</Text>
              <View className="flex-row items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <MaterialIcons name="transgender" size={20} color="#6b7280" className="ml-3" />

                {Platform.OS === 'ios' ? (
                  // iOS Picker
                  <Picker
                    style={{ flex: 1, height: 50 }}
                    itemStyle={{ fontSize: 16, color: '#111827' }}
                    selectedValue={formData.gender}
                    onValueChange={(itemValue) => handleInputChange('gender', itemValue)}>
                    <Picker.Item label="Select Gender" value="" color="#9ca3af" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                ) : (
                  // Android Picker
                  <Picker
                    style={{ flex: 1 }}
                    dropdownIconColor="#6b7280"
                    mode="dropdown"
                    dropdownIconRippleColor="#d1d5db"
                    numberOfLines={1}
                    selectedValue={formData.gender}
                    onValueChange={(itemValue) => handleInputChange('gender', itemValue)}>
                    <Picker.Item
                      label="Select Gender"
                      value=""
                      enabled={false}
                      style={{ color: '#9ca3af' }}
                    />
                    <Picker.Item
                      label="Male"
                      value="male"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                    <Picker.Item
                      label="Female"
                      value="female"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                    <Picker.Item
                      label="Other"
                      value="other"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                  </Picker>
                )}
              </View>
            </View>
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
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
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
                  value={formData.emergencyContactName}
                  onChangeText={(text) => handleInputChange('emergencyContactName', text)}
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
                  value={formData.emergencyContactPhone}
                  onChangeText={(text) => handleInputChange('emergencyContactPhone', text)}
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
                  value={formData.street}
                  onChangeText={(text) => handleInputChange('street', text)}
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
                  value={formData.postalCode}
                  onChangeText={(text) => handleInputChange('postalCode', text)}
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
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Address Proof</Text>
              <TouchableOpacity
                className="h-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleDocumentUpload('addressProof')}>
                {formData.addressProof ? (
                  <Image
                    source={{ uri: formData.addressProof }}
                    className="h-full w-full bg-gray-100"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="file-image-o" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload Address Proof</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-5">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Government ID</Text>
              <TouchableOpacity
                className="h-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleDocumentUpload('governmentId')}>
                {formData.governmentId ? (
                  <Image
                    source={{ uri: formData.governmentId }}
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

            <View className="mb-5">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Selfie Photograph</Text>
              <TouchableOpacity
                className="h-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleDocumentUpload('selfie')}>
                {formData.selfie ? (
                  <Image
                    source={{ uri: formData.selfie }}
                    className="h-full w-full rounded-full bg-gray-100"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="camera" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Take Selfie</Text>
                    <Text className="mt-1 text-xs text-gray-400">Clear face photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4: // Vehicle Information
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Vehicle Information</Text>
              <Text className="text-sm text-gray-500">Details about your vehicle</Text>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Vehicle Type</Text>
              <View className="flex-row items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <MaterialIcons name="directions-car" size={20} color="#6b7280" className="ml-3" />

                {Platform.OS === 'ios' ? (
                  // iOS Picker
                  <Picker
                    style={{ flex: 1, height: 50 }}
                    itemStyle={{ fontSize: 16, color: '#111827' }}
                    selectedValue={formData.vehicleType}
                    onValueChange={(itemValue) => handleInputChange('vehicleType', itemValue)}>
                    <Picker.Item label="Select Vehicle Type" value="" color="#9ca3af" />
                    <Picker.Item label="Bicycle" value="bicycle" />
                    <Picker.Item label="Bike" value="bike" />
                    <Picker.Item label="Scooter" value="scooter" />
                    <Picker.Item label="Car" value="car" />
                    <Picker.Item label="Van" value="van" />
                  </Picker>
                ) : (
                  // Android Picker
                  <Picker
                    style={{ flex: 1 }}
                    dropdownIconColor="#6b7280"
                    mode="dropdown"
                    dropdownIconRippleColor="#d1d5db"
                    numberOfLines={1}
                    selectedValue={formData.vehicleType}
                    onValueChange={(itemValue) => handleInputChange('vehicleType', itemValue)}>
                    <Picker.Item
                      label="Select Vehicle Type"
                      value=""
                      enabled={false}
                      style={{ color: '#9ca3af' }}
                    />
                    <Picker.Item
                      label="Bicycle"
                      value="bicycle"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                    <Picker.Item
                      label="Bike"
                      value="bike"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                    <Picker.Item
                      label="Scooter"
                      value="scooter"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                    <Picker.Item
                      label="Car"
                      value="car"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                    <Picker.Item
                      label="Van"
                      value="van"
                      style={{ fontSize: 16, color: '#111827' }}
                    />
                  </Picker>
                )}
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Registration Number</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <MaterialIcons name="confirmation-number" size={20} color="#6b7280" />
                <TextInput
                  className="ml-2 h-12 flex-1 text-base text-gray-900"
                  value={formData.vehicleRegistration}
                  onChangeText={(text) => handleInputChange('vehicleRegistration', text)}
                  placeholder="Vehicle registration number"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Vehicle Insurance</Text>
              <TouchableOpacity
                className="h-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleDocumentUpload('vehicleInsurance')}>
                {formData.vehicleInsurance ? (
                  <Image
                    source={{ uri: formData.vehicleInsurance }}
                    className="h-full w-full bg-gray-100"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="file-text-o" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload Insurance</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-5">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Driving License</Text>
              <TouchableOpacity
                className="h-36 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                onPress={() => handleDocumentUpload('drivingLicense')}>
                {formData.drivingLicense ? (
                  <Image
                    source={{ uri: formData.drivingLicense }}
                    className="h-full w-full bg-gray-100"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="id-card" size={32} color="#3b82f6" />
                    <Text className="mt-2 font-medium text-blue-500">Upload License</Text>
                    <Text className="mt-1 text-xs text-gray-400">JPG, PNG or PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 5: // Availability
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Work Availability</Text>
              <Text className="text-sm text-gray-500">When are you available?</Text>
            </View>

            <View className="mt-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (day) => (
                  <View key={day} className="mb-3 flex-row items-center justify-between">
                    <Text className="w-20 text-sm font-medium text-gray-700">{day}</Text>
                    <View className="flex-1 flex-row justify-between">
                      {['Morning', 'Afternoon', 'Evening'].map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          className={`rounded-md px-3 py-2 ${
                            formData.availability[
                              day.toLowerCase() as keyof typeof formData.availability
                            ]?.[slot.toLowerCase() as 'morning' | 'afternoon' | 'evening']
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-200 bg-gray-50'
                          } border`}
                          onPress={() => {
                            const updatedAvailability = { ...formData.availability };
                            const dayKey = day.toLowerCase() as keyof typeof updatedAvailability;
                            const slotKey = slot.toLowerCase() as
                              | 'morning'
                              | 'afternoon'
                              | 'evening';

                            updatedAvailability[dayKey][slotKey] =
                              !updatedAvailability[dayKey][slotKey];

                            handleInputChange('availability', updatedAvailability);
                          }}>
                          <Text
                            className={`text-xs ${
                              formData.availability[
                                day.toLowerCase() as keyof typeof formData.availability
                              ]?.[slot.toLowerCase() as 'morning' | 'afternoon' | 'evening']
                                ? 'text-white'
                                : 'text-gray-500'
                            }`}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        );

      case 6: // Review
        return (
          <View className="mb-3 rounded-xl bg-white p-5 shadow-sm">
            <View className="mb-5">
              <Text className="text-xl font-bold text-gray-900">Review Your Information</Text>
              <Text className="text-sm text-gray-500">Check all details before submitting</Text>
            </View>

            <ScrollView className="max-h-96">
              <View className="mb-6">
                <Text className="mb-3 border-b border-gray-200 pb-1.5 text-base font-bold text-gray-900">
                  Personal Details
                </Text>
                <ReviewItem label="Full Name" value={formData.fullName} icon="person" />
                <ReviewItem
                  label="Date of Birth"
                  value={formData.dateOfBirth.toDateString()}
                  icon="event"
                />
                <ReviewItem label="Gender" value={formData.gender} icon="transgender" />
              </View>

              <View className="mb-6">
                <Text className="mb-3 border-b border-gray-200 pb-1.5 text-base font-bold text-gray-900">
                  Contact Information
                </Text>
                <ReviewItem label="Phone Number" value={formData.phoneNumber} icon="phone" />
                <ReviewItem label="Email" value={formData.email} icon="email" />
                <ReviewItem
                  label="Emergency Contact"
                  value={`${formData.emergencyContactName} (${formData.emergencyContactPhone})`}
                  icon="contact-emergency"
                />
              </View>

              <View className="mb-6">
                <Text className="mb-3 border-b border-gray-200 pb-1.5 text-base font-bold text-gray-900">
                  Address
                </Text>
                <ReviewItem label="Street" value={formData.street} icon="home" />
                <ReviewItem label="City" value={formData.city} icon="location-city" />
                <ReviewItem
                  label="Postal Code"
                  value={formData.postalCode}
                  icon="markunread-mailbox"
                />
              </View>

              <View className="mb-6">
                <Text className="mb-3 border-b border-gray-200 pb-1.5 text-base font-bold text-gray-900">
                  Vehicle Information
                </Text>
                <ReviewItem
                  label="Vehicle Type"
                  value={formData.vehicleType}
                  icon="directions-car"
                />
                <ReviewItem
                  label="Registration"
                  value={formData.vehicleRegistration}
                  icon="confirmation-number"
                />
              </View>

              <View className="mb-6">
                <Text className="mb-3 border-b border-gray-200 pb-1.5 text-base font-bold text-gray-900">
                  Documents
                </Text>
                <ReviewDocument label="Address Proof" value={formData.addressProof} />
                <ReviewDocument label="Government ID" value={formData.governmentId} />
                <ReviewDocument label="Selfie" value={formData.selfie} />
                <ReviewDocument label="Vehicle Insurance" value={formData.vehicleInsurance} />
                <ReviewDocument label="Driving License" value={formData.drivingLicense} />
              </View>
            </ScrollView>
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      console.log('Form submitted:', formData);
      // Add your form submission logic here
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
      <ScrollView className="flex-1 px-5">
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
          onPress={handleNext}>
          <Text className="font-medium text-white">
            {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
          </Text>
          {currentStep < steps.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="white" className="ml-2" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
