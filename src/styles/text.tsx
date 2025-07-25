import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const textStyles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
  },
  body: {
    fontSize: 16,
    color: COLORS.black,
  },
  caption: {
    fontSize: 14,
    color: COLORS.gray,
  },
  link: {
    fontSize: 16,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
