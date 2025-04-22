
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Check, Plus, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#6C63FF";
const BG = "#F7F8FA";
const CARD = "#fff";
const CARD_SHADOW = "#E0E3EB";
const TEXT = "#22223B";
const SUBTLE = "#8D99AE";
const BORDER = "#E0E3EB";

const STORAGE_KEY = "TODOS_V1";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setTodos(JSON.parse(data));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loading]);

  const addTodo = (text: string) => {
    setTodos((prev) => [
      { id: Date.now().toString(), text, completed: false },
      ...prev,
    ]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}

export default function TodosScreen() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const insets = useSafeAreaInsets();

  // Animation for add input
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: adding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [adding]);

  const handleAdd = () => {
    if (input.trim().length === 0) return;
    addTodo(input.trim());
    setInput("");
    setAdding(false);
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TodoCard
      todo={item}
      onToggle={() => toggleTodo(item.id)}
      onDelete={() => deleteTodo(item.id)}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Today's Todos</Text>
      <Animated.View
        style={[
          styles.addContainer,
          {
            height: inputAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 56],
            }),
            opacity: inputAnim,
            marginBottom: inputAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 16],
            }),
          },
        ]}
      >
        <View style={styles.addInputRow}>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor={SUBTLE}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoFocus
            maxLength={80}
          />
          <TouchableOpacity
            style={[
              styles.addBtn,
              { opacity: input.trim().length === 0 ? 0.5 : 1 },
            ]}
            onPress={handleAdd}
            disabled={input.trim().length === 0}
            accessibilityLabel="Add todo"
          >
            <Plus color="#fff" size={22} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          todos.length === 0 && { flex: 1, justifyContent: "center" },
        ]}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No todos yet. Add one!</Text>
            </View>
          )
        }
        keyboardShouldPersistTaps="handled"
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAdding((a) => !a)}
        activeOpacity={0.8}
        accessibilityLabel="Show add todo input"
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>
    </View>
  );
}

function TodoCard({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const anim = useRef(new Animated.Value(todo.completed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: todo.completed ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [todo.completed]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: CARD,
          shadowColor: CARD_SHADOW,
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.6],
          }),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onToggle}
        accessibilityLabel={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <Animated.View
          style={[
            styles.checkboxBox,
            {
              borderColor: ACCENT,
              backgroundColor: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ["#fff", ACCENT],
              }),
            },
          ]}
        >
          {todo.completed && <Check color="#fff" size={18} />}
        </Animated.View>
      </TouchableOpacity>
      <Text
        style={[
          styles.cardText,
          todo.completed && styles.cardTextCompleted,
        ]}
        numberOfLines={2}
      >
        {todo.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        accessibilityLabel="Delete todo"
      >
        <Trash2 color={SUBTLE} size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: Platform.select({ ios: "Inter-Bold", android: "Inter_700Bold", default: "Inter_700Bold" }),
    fontSize: 32,
    color: TEXT,
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: -1,
  },
  addContainer: {
    overflow: "hidden",
    justifyContent: "center",
  },
  addInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 12,
    shadowColor: CARD_SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: TEXT,
    fontFamily: Platform.select({ ios: "Inter-Regular", android: "Inter_400Regular", default: "Inter_400Regular" }),
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  addBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 8,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingBottom: 120,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: CARD,
    shadowColor: CARD_SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  checkbox: {
    marginRight: 14,
  },
  checkboxBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    fontSize: 18,
    color: TEXT,
    fontFamily: Platform.select({ ios: "Inter-Regular", android: "Inter_400Regular", default: "Inter_400Regular" }),
  },
  cardTextCompleted: {
    color: SUBTLE,
    textDecorationLine: "line-through",
  },
  deleteBtn: {
    marginLeft: 10,
    padding: 4,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 36,
    backgroundColor: ACCENT,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    color: SUBTLE,
    fontSize: 18,
    fontFamily: Platform.select({ ios: "Inter-Regular", android: "Inter_400Regular", default: "Inter_400Regular" }),
  },
});