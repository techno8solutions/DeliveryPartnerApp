import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Navigation from '~/navigations/Navigation';
import { store } from './src/redux/store';
import './global.css';
import useOnlineStatus from '~/hooks/useOnlineStatus';

const MainApp = () => {
  useOnlineStatus();
  return <Navigation />;
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <MainApp />
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
