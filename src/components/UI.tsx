import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...Shadow.md,
    };

    // Size variants
    switch (size) {
      case 'sm':
        baseStyle.height = 36;
        baseStyle.paddingHorizontal = Spacing.md;
        break;
      case 'lg':
        baseStyle.height = 52;
        baseStyle.paddingHorizontal = Spacing['2xl'];
        break;
      default:
        baseStyle.height = 44;
        baseStyle.paddingHorizontal = Spacing.lg;
    }

    // Color variants
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = Colors.secondary[500];
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = Colors.primary[500];
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      case 'success':
        baseStyle.backgroundColor = Colors.success[500];
        break;
      case 'warning':
        baseStyle.backgroundColor = Colors.warning[500];
        break;
      case 'error':
        baseStyle.backgroundColor = Colors.error[500];
        break;
      default:
        baseStyle.backgroundColor = Colors.primary[500];
    }

    if (disabled) {
      baseStyle.backgroundColor = Colors.neutral[300];
      baseStyle.shadowOpacity = 0;
      baseStyle.elevation = 0;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle: TextStyle = {
      ...styles.buttonText,
    };

    switch (size) {
      case 'sm':
        baseTextStyle.fontSize = Typography.fontSize.sm;
        break;
      case 'lg':
        baseTextStyle.fontSize = Typography.fontSize.lg;
        break;
      default:
        baseTextStyle.fontSize = Typography.fontSize.base;
    }

    if (variant === 'outline') {
      baseTextStyle.color = Colors.primary[500];
    } else if (variant === 'ghost') {
      baseTextStyle.color = Colors.primary[500];
    }

    if (disabled) {
      baseTextStyle.color = Colors.neutral[500];
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary[500] : Colors.neutral[0]} 
          />
        ) : (
          <>
            {icon && <View style={styles.buttonIcon}>{icon}</View>}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'lg',
}) => {
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: Colors.neutral[0],
      borderRadius: BorderRadius.xl,
      padding: Spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        Object.assign(baseStyle, Shadow.lg);
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = Colors.neutral[200];
        break;
      default:
        Object.assign(baseStyle, Shadow.md);
    }

    return baseStyle;
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

interface TagProps {
  text: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'mood' | 'category' | 'outline';
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({
  text,
  selected = false,
  onPress,
  variant = 'default',
  size = 'md',
}) => {
  const getTagStyle = () => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: size === 'sm' ? Spacing.sm : Spacing.md,
      paddingVertical: size === 'sm' ? Spacing.xs : Spacing.sm,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
    };

    if (variant === 'outline') {
      if (selected) {
        baseStyle.backgroundColor = Colors.primary[500];
        baseStyle.borderColor = Colors.primary[500];
      } else {
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = Colors.neutral[300];
      }
    } else {
      if (selected) {
        baseStyle.backgroundColor = Colors.primary[500];
        baseStyle.borderColor = Colors.primary[500];
      } else {
        baseStyle.backgroundColor = Colors.neutral[50];
        baseStyle.borderColor = Colors.neutral[200];
      }
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle: TextStyle = {
      fontSize: size === 'sm' ? Typography.fontSize.xs : Typography.fontSize.sm,
      fontWeight: '500',
    };

    if (variant === 'outline') {
      if (selected) {
        baseTextStyle.color = Colors.white;
      } else {
        baseTextStyle.color = Colors.neutral[600];
      }
    } else {
      if (selected) {
        baseTextStyle.color = Colors.white;
      } else {
        baseTextStyle.color = Colors.neutral[600];
      }
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity style={getTagStyle()} onPress={onPress} activeOpacity={0.7}>
      <Text style={getTextStyle()}>#{text}</Text>
    </TouchableOpacity>
  );
};

interface MoodSelectorProps {
  selectedMood: number;
  onMoodSelect: (mood: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  size = 'md',
}) => {
  const moodEmojis = ['😞', '😐', '😊', '😄', '🤩'];
  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 60;
      default: return 50;
    }
  };

  const getEmojiSize = () => {
    switch (size) {
      case 'sm': return 20;
      case 'lg': return 32;
      default: return 24;
    }
  };

  return (
    <View style={styles.moodSelector}>
      {moodEmojis.map((emoji, index) => {
        const mood = index + 1;
        const isSelected = selectedMood === mood;
        
        return (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              {
                width: getButtonSize(),
                height: getButtonSize(),
                backgroundColor: isSelected ? Colors.mood[mood as keyof typeof Colors.mood] : Colors.neutral[0],
                borderColor: isSelected ? Colors.mood[mood as keyof typeof Colors.mood] : Colors.neutral[200],
              },
              isSelected && Shadow.md,
            ]}
            onPress={() => onMoodSelect(mood)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: getEmojiSize() }}>{emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontWeight: '600',
    color: Colors.neutral[0],
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  moodButton: {
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
