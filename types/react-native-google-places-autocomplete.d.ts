declare module 'react-native-google-places-autocomplete' {
  import React from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

  export interface GooglePlacesAutocompleteProps {
    placeholder?: string;
    onPress?: (data: any, details: any) => void;
    query?: {
      key: string;
      language?: string;
      components?: string;
    };
    fetchDetails?: boolean;
    enablePoweredByContainer?: boolean;
    styles?: {
      container?: ViewStyle;
      textInputContainer?: ViewStyle;
      textInput?: TextStyle;
      listView?: ViewStyle;
      row?: ViewStyle;
      description?: TextStyle;
      separator?: ViewStyle;
    };
    textInputProps?: any;
    renderLeftButton?: () => React.ReactNode;
    renderRightButton?: () => React.ReactNode;
    nearbyPlacesAPI?: string;
    GooglePlacesSearchQuery?: any;
    GooglePlacesDetailsQuery?: any;
    filterReverseGeocodingByTypes?: string[];
    debounce?: number;
    onFail?: (error: any) => void;
    onNotFound?: () => void;
    listEmptyComponent?: () => React.ReactNode;
  }

  const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps>;
  export default GooglePlacesAutocomplete;
}
