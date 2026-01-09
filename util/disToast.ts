import Toast from 'react-native-toast-message';

type Props = {
  message: string;
  message2?: string;
  type: 'success' | 'error' | 'info';
  visibilityTime?: number;
}

const displayToast = ({ message, message2, type , visibilityTime = 2000 } : Props) => {
  Toast.show({
    type: type,
    text1: message,
    text2: message2,
    position: 'top',
    visibilityTime: visibilityTime,
  });
}

export { displayToast };
