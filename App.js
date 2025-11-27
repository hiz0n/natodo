import React, { useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Platform, FlatList, Pressable, Image, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [photo, setPhoto] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState(new Date())
  const [editPhoto, setEditPhoto] = useState(null)
  const [editShowPicker, setEditShowPicker] = useState(false)

  // 타이틀 애니메이션
  const titleScale = useRef(new Animated.Value(1)).current
  const titleColor = useRef(new Animated.Value(0)).current; // 0 = #333 , 1 = #888


  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(titleColor, {
          toValue : 1,
          duration : 800, 
          useNativeDriver : false,
        }),
        Animated.timing(titleColor, {
          toValue : 0,
          duration : 800,
          useNativeDriver : false,
        }),
        Animated.delay(1400),
      ])
    )

    loopAnim.start()
    return () => loopAnim.stop()
  }, [])

  // 리스트가 추가될 때 애니메이션
  


  // 날짜 포맷
  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // 오늘 날짜 (요일 포함)
  const formatToday = () => {
    const today = new Date()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const dayName = dayNames[today.getDay()]
    const month = monthNames[today.getMonth()]
    const dayTo = today.getDate()
    const year = today.getFullYear()

    return `${dayName}, ${month} ${dayTo}, ${year}`
  }

  // 추가
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

  // 삭제
  const removeTodo = (id) => {
    setTodos(todos.filter((item) => item.id !== id))
  }

  // 날짜 변경
  const changeDate = (e, chdate) => {
    if (e.type === 'dismissed') {
      setShowPicker(false)
      return
    }

    setShowPicker(false)
    if (chdate) setDate(chdate)
  }

  // 촬영
  const getPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return alert('카메라 권한 필요')

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })
    if (result.canceled) return
    setPhoto(result.assets[0].uri)
  }

  // 갤러리
  const getGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return alert('갤러리 권한 필요')

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    })
    if (result.canceled) return
    setPhoto(result.assets[0].uri)
  }

  // 수정 저장
  const updateTodo = (id) => {
    setTodos(
      todos.map((item) =>
        item.id === id
          ? {
              ...item,
              title: editText,
              date: formatDate(editDate),
              photos: editPhoto,
            }
          : item
      )
    )
    setEditingId(null)
  }

  // 수정 시작
  const startEdit = (item) => {
    setEditingId(item.id)
    setEditText(item.title)
    setEditDate(new Date(item.date))
    setEditPhoto(item.photos)
  }

  // 수정 중 날짜 선택
  const changeEditDate = (e, chdate) => {
    if (e.type === 'dismissed') {
      setEditShowPicker(false)
      return
    }
    setEditShowPicker(false)
    if (chdate) setEditDate(chdate)
  }

  // 수정 중 촬영
  const editPhotoCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
    if (!result.canceled) setEditPhoto(result.assets[0].uri)
  }

  // 수정 중 갤러리
  const editPhotoGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 })
    if (!result.canceled) setEditPhoto(result.assets[0].uri)
  }

  return (
    <View style={styles.container}>
      <View style={styles.outBox}>
        <Text style={styles.todayText}>{formatToday()}</Text>
        <Animated.Text style={[styles.title, {color:titleColor.interpolate({
          inputRange : [0, 1],
          outputRange : ['#333', '#bbb']
        })}]}>To-Do List</Animated.Text>
        

        {/* 입력 */}
        <TextInput
          style={styles.input}
          placeholder="할 일을 입력하세요"
          value={text}
          onChangeText={setText}
        />

        {/* 버튼줄 */}
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

        {/* 사진 미리보기 */}
        {photo && (
          <View style={styles.previewBox}>
            <Image source={{ uri: photo }} style={styles.previewImage} />
          </View>
        )}

        {showPicker && (
          <DateTimePicker value={date} mode="date" onChange={changeDate} display="default" />
        )}

        {/* 리스트 */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.listBox}>
              <View style={{ flexDirection: 'row' }}>
                {item.photos && (
                  <Image source={{ uri: item.photos }} style={styles.todoImage} />
                )}

                {/* ⭐ 오른쪽에 붙도록 flex:1 지정 */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text>{index + 1}. {item.title}</Text>
                  <Text>{item.date}</Text>

                  {/* 수정/삭제 가로 정렬 */}
                  <View style={styles.actionRow}>
                    <Pressable style={styles.modifyBtn} onPress={() => startEdit(item)}>
                      <Text style={styles.modifyText}>수정</Text>
                    </Pressable>

                    <Pressable style={styles.deleteBtn} onPress={() => removeTodo(item.id)}>
                      <Text style={styles.deleteText}>삭제</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* 수정 화면 */}
              {editingId === item.id && (
                <View style={styles.editBox}>
                  <Text style={styles.label}>내용</Text>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    style={styles.editInput}
                  />

                  <Text style={styles.label}>날짜</Text>
                  <Pressable
                    style={styles.editDateBtn}
                    onPress={() => setEditShowPicker(true)}
                  >
                    <Text style={styles.btnText}>{formatDate(editDate)}</Text>
                  </Pressable>

                  {editShowPicker && (
                    <DateTimePicker
                      value={editDate}
                      mode="date"
                      onChange={changeEditDate}
                    />
                  )}

                  <Text style={styles.label}>사진</Text>
                  <View style={styles.photoRow}>
                    <Pressable style={styles.photoBtn} onPress={editPhotoCamera}>
                      <Text style={styles.btnText}>촬영</Text>
                    </Pressable>

                    <Pressable style={styles.photoBtn} onPress={editPhotoGallery}>
                      <Text style={styles.btnText}>갤러리</Text>
                    </Pressable>
                  </View>

                  {editPhoto && (
                    <Image source={{ uri: editPhoto }} style={styles.previewImage} />
                  )}

                  <View style={styles.saveRow}>
                    <Pressable style={styles.saveBtn} onPress={() => updateTodo(item.id)}>
                      <Text style={styles.saveText}>저장</Text>
                    </Pressable>

                    <Pressable style={styles.cancelBtn} onPress={() => setEditingId(null)}>
                      <Text style={styles.cancelText}>취소</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
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
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  outBox: { flex: 1, width: '100%' },
  todayText: { color: '#999', fontSize: 20, marginBottom: 4 },
  title: { fontSize: 40, fontWeight: 'bold', marginBottom: 15, color:'#333' },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 3,
    fontSize: 16,
    marginBottom: 10,
  },

  rowButtons: { flexDirection: "row", gap: 8, marginBottom: 16 },
  smallBtn: {
    flex: 1, backgroundColor: "#5786ff",
    paddingVertical: 10, borderRadius: 3, alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },

  previewBox: { alignItems: "center", marginBottom: 16 },
  previewImage: { width: '100%', height: 250, borderRadius: 6, marginTop: 10, resizeMode: "cover" },

  listBox: { marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderColor: "#eee", paddingTop:10 },

  todoImage: { width: 80, height: 80, borderRadius: 3 },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modifyBtn: { backgroundColor: "#e0f0ff", paddingHorizontal:10, paddingVertical: 6, borderRadius: 3 },
  deleteBtn: { backgroundColor: "#ffe0e0", paddingHorizontal:10, paddingVertical: 6, borderRadius: 3 },
  modifyText: { color: "#5786ff", fontWeight: "bold", padding:4 },
  deleteText: { color: "#aa0000", fontWeight: "bold", padding:4 },

  editBox: {
    marginTop: 12,
    backgroundColor: "#f7faff",
    padding: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: { marginTop: 10, marginBottom: 4, fontWeight: "bold" },
  editInput: {
    borderWidth: 1, borderColor: "#aaa",
    borderRadius: 3, padding: 8, backgroundColor : '#fff'
  },

  editDateBtn: {
    backgroundColor: "#5786ff",
    paddingVertical: 10,
    borderRadius: 3,
    alignItems: "center",
    marginBottom: 10,
  },

  photoRow: { flexDirection:"row", gap:10 },
  photoBtn: {
    flex: 1,
    backgroundColor: "#5786ff",
    paddingVertical: 10,
    borderRadius: 3,
    alignItems: "center",
  },

  saveRow: { flexDirection: "row", marginTop: 20, gap: 10 },
  saveBtn: {
    flex: 1, backgroundColor: "#5786ff",
    paddingVertical: 10, borderRadius: 3, alignItems: "center",
  },
  cancelBtn: {
    flex: 1, backgroundColor: "#ccc",
    paddingVertical: 10, borderRadius: 3, alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelText: { color: "#333", fontWeight: "bold" },
});
