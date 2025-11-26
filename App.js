import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, Platform, FlatList, Pressable, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [photo, setPhoto] = useState(null)

  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const addTodo = () => {
    if (!text.trim()) return

    const newTodo = {
      id: Date.now().toString(),
      title: text.trim(),
      date: formatDate(date),
      photos: photo,
    }
    setTodos([newTodo, ...todos])
    setText('')
    setPhoto(null)
  }

  const removeTodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id))
  }

  const changeDate = (e, chdate) => {
    if (e.type === 'dismissed') {
      setShowPicker(false)
      return
    }

    setShowPicker(false)
    if (chdate) {
      setDate(chdate)
    }
  }

  // 사진 촬영
  const getPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== 'granted') {
      alert('카메라 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if (result.canceled) return

    const uri = result.assets[0].uri
    setPhoto(uri)
  }

  // 갤러리 선택
  const getGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('갤러리 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if (result.canceled) return

    const uri = result.assets[0].uri
    setPhoto(uri)
  }

  return (
    <View style={styles.container}>
      <View style={styles.outBox}>

        <Text style={styles.title}>Todo List</Text>

        {/* ------------------------ 입력창 영역 ------------------------ */}
        {/* TextInput 한 줄 전체 */}
        <TextInput
          style={styles.input}
          placeholder="할 일을 입력하세요"
          value={text}
          onChangeText={setText}
        />

        {/* 버튼들 한 줄 */}
        <View style={styles.rowButtons}>
          <Pressable style={styles.smallBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.btnText}>{formatDate(date)}</Text>
          </Pressable>

          <Pressable style={styles.smallBtn} onPress={getPhoto}>
            <Text style={styles.btnText}>촬영</Text>
          </Pressable>

          <Pressable style={styles.smallBtn} onPress={getGallery}>
            <Text style={styles.btnText}>갤러리</Text>
          </Pressable>

          <Pressable style={styles.smallBtn} onPress={addTodo}>
            <Text style={styles.btnText}>추가</Text>
          </Pressable>
        </View>
        {/* ----------------------------------------------------------- */}

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={changeDate}
          />
        )}

        {/* 리스트 */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.listText}>추가된 할 일이 없습니다.</Text>
          }
          renderItem={({ item, index }) => (
            <Pressable onLongPress={() => removeTodo(item.id)} style={styles.todoItem}>
              {item.photos && (
                <Image
                  source={{ uri: item.photos }}
                  style={styles.todoImage}
                />
              )}

              <View style={{ marginLeft: 10 }}>
                <Text>{index + 1}. {item.title}</Text>
                <Text>{item.date}</Text>
                <Text style={styles.hintText}>길게 눌러서 삭제</Text>
              </View>
            </Pressable>
          )}
        />

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  outBox: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },

  // ★ 여기 수정된 INPUT 스타일
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },

  // ★ 버튼 줄
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },

  smallBtn: {
    flex: 1,
    backgroundColor: "#0c2470",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  listText: {
    marginTop: 30,
    alignSelf: 'center',
    fontSize: 16,
  },

  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  todoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  hintText: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  }
});
